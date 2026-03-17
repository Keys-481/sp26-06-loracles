import argparse
import json
import sys
from pathlib import Path
from threading import Thread, Event
from typing import Dict, List

import cv2
import zmq

from src.inference.interface.utils import TextRecognitionOutput
from src.inference.model_router import ModelRouter
from src.inference.interface.base_models import LineSegmentationModel, HTRModel, BaseModel


class InferenceServer:
    def __init__(self, port: int | str, models_dir: str):
        self.model_router = ModelRouter(Path(models_dir))
        self.line_seg: LineSegmentationModel | None = None
        self.htr: HTRModel | None = None

        self.ctx = zmq.Context()
        self.router = self.ctx.socket(zmq.ROUTER)
        self.router.bind(f"tcp://*:{port}")
        print(f'Router listening on port {port}')

        self.is_dead = Event()
        self._loop = Thread(target=self._loop, daemon=False)
        self._loop.start()

    def _loop(self):
        print('Inference loop started')
        while not self.is_dead.is_set():
            identifier, _, topic, payload = self.router.recv_multipart()
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
                    img = cv2.imread(Path(payload.decode()))
                    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

                    polygons = self.line_seg([img])
                    outputs: List[TextRecognitionOutput] = self.htr(images=[img], polygons=[polygons])

                    rt_val = {}
                    for output in outputs:
                        for annotation in output.annotations:
                            rt_val[annotation.text] = [(int(pnt.x), int(pnt.y)) for pnt in annotation.polygon.points]

                    self.router.send_multipart([identifier, b'', topic.encode(), json.dumps(rt_val).encode()])
                case 'kill':
                    self.ctx.destroy()
                    self.is_dead.set()
                case _:
                    print(f'Got payload {payload} on topic {topic} from {identifier}')
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

    def get_model(self, model_name: str, model_type: type[HTRModel] | type[LineSegmentationModel]) -> HTRModel | LineSegmentationModel | None:
        try:
            model = self.model_router.models[model_name]
            return model() if issubclass(model, model_type) else None
        except KeyError as e:
            print(f'No model found for model_name={model_name}: {e}')


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--models_dir', required=True, type=str, help='Path to model directory')
    parser.add_argument('--port', required=True, type=int, help='Port to bind to')
    parser.add_argument('--test_image_path', required=False, type=str)
    args = parser.parse_args()

    models_dir = args.models_dir
    port = args.port
    test_image_path = args.test_image_path

    sys.path.append(models_dir)

    ctx = zmq.Context()
    dealer = ctx.socket(zmq.DEALER)

    inf = InferenceServer(port=port, models_dir=models_dir)
    dealer.connect(f'tcp://localhost:{port}')
    print(f'Dealer connected to port {port}\n')

    dealer.send_multipart([b'', b'query_available_models', b''])
    _, _, payload = dealer.recv_multipart()
    print(f'Available models: {payload.decode()}')

    dealer.send_multipart([b'', b'line_seg_use', b'HiSAM'])
    dealer.send_multipart([b'', b'htr_use', b'CRNN'])

    dealer.send_multipart([b'', b'infer', test_image_path.encode()])
    _, _, payload = dealer.recv_multipart()
    print(f'Received payload {payload.decode()}')

    dealer.send_multipart([b'', b'kill', b''])
    dealer.close()
