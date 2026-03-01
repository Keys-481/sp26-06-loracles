import importlib
import inspect
import sys
from pathlib import Path
from typing import Dict, Tuple, Type

from .interface import BaseModel


class ModelRouter:

    def __init__(self, models_dir: Path) -> None:
        self.models_dir = models_dir
        self.models = self.discover(models_dir)

    def __call__(self, seg_model: str, htr_model: str) -> Tuple[Type[BaseModel], Type[BaseModel]] | None:
        line_seg = self.models.get(seg_model)
        htr = self.models.get(htr_model)
        if line_seg is None:
            raise ValueError(f"Model {seg_model} not found.")
        if htr is None:
            raise ValueError(f"Model {htr_model} not found.")
        return line_seg, htr

    def update_models(self):
        self.models = self.discover(self.models_dir)

    @staticmethod
    def discover(models_dir: Path) -> Dict[str, Type[BaseModel]]:
        """
        Scans models_dir and returns a dict mapping each model name to its
        concrete BaseModel subclass. Skips any subdirectory that cannot be
        imported or does not define a concrete BaseModel subclass.

        Args:
            models_dir: Directory to scan for models.

        Returns:
            Dict mapping model name to its concrete BaseModel subclass.
        """
        models_dir = models_dir.resolve()
        if not models_dir.is_dir():
            print(f"Warning: {models_dir} is not a directory.")
            return {}

        module_prefix = ".".join(models_dir.parts)
        for root in sys.path:
            try:
                module_prefix = ".".join(models_dir.relative_to(Path(root or ".").resolve()).parts)
                break
            except ValueError:
                continue

        models: Dict[str, Type[BaseModel]] = {}
        for entry in sorted(models_dir.iterdir()):
            entry = entry.resolve()
            if not entry.is_dir() or not entry.is_relative_to(models_dir):
                continue

            dir_name = entry.name
            module_file = entry / f"{dir_name.lower()}.py"
            if not module_file.is_file():
                continue

            try:
                module = importlib.import_module(f"{module_prefix}.{dir_name}.{dir_name.lower()}")
            except Exception as e:
                print(f"Warning: Failed to import {module_prefix}.{dir_name}.{dir_name.lower()}: {e}")
                continue

            model_cls = next(
                (
                    obj for _, obj in inspect.getmembers(module, inspect.isclass)
                    if issubclass(obj, BaseModel)
                       and obj is not BaseModel
                       and not inspect.isabstract(obj)
                       and obj.__module__ == module.__name__
                ),
                None,
            )
            if model_cls is not None:
                models[dir_name] = model_cls

        return models


if __name__ == "__main__":
    models_dir = Path("src/inference/models/")
    model_router = ModelRouter(models_dir)
    print(model_router.models)
