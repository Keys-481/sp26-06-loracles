import argparse
import json
import sys
import uuid
from pathlib import Path
from threading import Thread, Event
from typing import Dict, List

import zmq

from src.inference.interface.base_models import LineSegmentationModel, HTRModel
from src.inference.interface.utils import to_builtin
from src.inference.model_router import ModelRouter


class InferenceServer:
    def __init__(self, port: int | str, models_dir: str, temp_dir: str):
        self.temp_dir = Path(temp_dir)
        self.temp_dir.mkdir(parents=True, exist_ok=True)
        self.model_router = ModelRouter(Path(models_dir))
        self.line_seg: LineSegmentationModel | None = None
        self.htr: HTRModel | None = None

        self.ctx = zmq.Context()
        self.router = self.ctx.socket(zmq.ROUTER)
        self.router.bind(f"tcp://*:{port}")
        print(f'Router listening on port {port}')

        self.is_dead = Event()
        self._loop_thread = Thread(target=self._loop, daemon=False)
        self._loop_thread.start()

    def shutdown(self):
        if not self.is_dead.is_set():
            self.is_dead.set()
            self.ctx.destroy(linger=0)
        self._loop_thread.join()

    def _loop(self):
        print('Inference loop started')
        while not self.is_dead.is_set():
            try:
                identifier, _, topic, payload = self.router.recv_multipart()
            except zmq.ZMQError:
                break
            topic = topic.decode()

            match topic:
                case 'query_available_models':
                    available_models = json.dumps(self.query_available_models()).encode()
                    self.router.send_multipart([identifier, b'', topic.encode(), available_models])
                case 'htr_use':
                    self.htr = self.get_model(model_name=payload.decode(), model_type=HTRModel)
                case 'line_seg_use':
                    self.line_seg = self.get_model(model_name=payload.decode(), model_type=LineSegmentationModel)
                case 'infer':
                    if self.htr is None or self.line_seg is None:
                        raise RuntimeError('HTR or LineSegmentation model not available')

                    img_paths = json.loads(payload.decode())
                    self.router.send_multipart([
                        identifier,
                        b'',
                        topic.encode(),
                        json.dumps(self.infer(img_paths)).encode()
                    ])
                case 'kill':
                    self.is_dead.set()
                case _:
                    print(f'Got payload {payload} on topic {topic} from {identifier}')
        if not self.ctx.closed:
            self.ctx.destroy()
        print('Inference loop ended')

    def query_available_models(self) -> Dict[str, List[str]]:
        self.model_router.update_models()
        print(f'models found: {self.model_router.models}')
        available_models = {'HTR': [], 'LineSegmentation': []}
        for model in self.model_router.models:
            if issubclass(self.model_router.models[model], HTRModel):
                available_models['HTR'].append(model)
            if issubclass(self.model_router.models[model], LineSegmentationModel):
                available_models['LineSegmentation'].append(model)
        return available_models

    def infer(self, img_paths: List[str]) -> List[str]:
        assert self.line_seg is not None
        assert self.htr is not None
        polygons = self.line_seg(image_paths=img_paths)
        outputs = self.htr(image_paths=img_paths, polygons=polygons)

        outlist = []
        for output in outputs:
            filename = self.temp_dir / f'{uuid.uuid4()}.json'
            with open(filename, 'w') as outfile:
                results = to_builtin(output)
                json.dump(results, outfile)
            outlist.append(str(filename))
        return outlist

    def get_model(self, model_name: str,
                  model_type: type[HTRModel] | type[LineSegmentationModel]) -> HTRModel | LineSegmentationModel | None:
        try:
            model = self.model_router.models[model_name]
            return model() if issubclass(model, model_type) else None
        except KeyError as e:
            print(f'No model found for model_name={model_name}: {e}')


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--models_dir', required=True, type=str, help='Path to model directory')
    parser.add_argument('--port', required=True, type=int, help='Port to bind to')
    parser.add_argument('--temp_dir', required=True, type=str, help='Path for output JSON files')
    args = parser.parse_args()

    server = InferenceServer(port=args.port, models_dir=args.models_dir, temp_dir=args.temp_dir)
    # Block until Electron closes the stdin pipe
    sys.stdin.read()
    server.shutdown()
