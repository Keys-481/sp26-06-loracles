from typing import Dict, List

from src.inference.interface import LineSegmentationModel, LineSegmentationOutput


class Example(LineSegmentationModel):
    def __init__(self):
        pass

    @property
    def name(self) -> str:
        return "Example"

    @property
    def description(self) -> str:
        return "An example wrapper for a line segmentation model."

    @property
    def user_options(self) -> Dict[str, int | float | str] | None:
        return None

    @property
    def advanced_user_options(self) -> Dict[str, int | float | str] | None:
        return None

    def __call__(self, image_paths: List[str]) -> List[LineSegmentationOutput]:
        outputs = []
        for pth in image_paths:
            polygons = []
            outputs.append(LineSegmentationOutput(polygons=polygons, image_path=pth))
        return outputs
