from dataclasses import dataclass, is_dataclass, asdict
from typing import NamedTuple, List, Union

PolygonPoint = NamedTuple('Point', [('x', int), ('y', int)])
Polygon = NamedTuple('Polygon', [('points', List[PolygonPoint])])

TextAnnotation = NamedTuple('TextAnnotation', [('text', str), ('polygon', Polygon)])


@dataclass
class LineSegmentationOutput:
    polygons: List[Polygon]
    image_path: str

    def __post_init__(self):
        for poly in self.polygons:
            if not isinstance(poly, Polygon):
                raise TypeError(f"Expected Polygon, got {type(poly)}")


@dataclass
class TextRecognitionOutput:
    annotations: List[TextAnnotation]
    image_path: str

    def __post_init__(self):
        for annotation in self.annotations:
            if not isinstance(annotation, TextAnnotation):
                raise TypeError(f"Expected TextAnnotation, got {type(annotation)}")


def to_builtin(obj: Union[
    LineSegmentationOutput, TextRecognitionOutput, List[LineSegmentationOutput], List[TextRecognitionOutput]]) -> Union[
    dict, List[dict]]:
    if is_dataclass(obj):
        return asdict(obj)
    if isinstance(obj, list):
        return [to_builtin(v) for v in obj]
    raise TypeError(f"Expected dataclass or list, got {type(obj)}")
