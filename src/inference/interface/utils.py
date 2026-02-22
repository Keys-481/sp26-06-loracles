from dataclasses import dataclass
from typing import NamedTuple, List

PolygonPoint = NamedTuple('Point', [('x', int), ('y', int)])
Polygon = NamedTuple('Polygon', [('points', List[PolygonPoint])])


@dataclass
class LineSegmentationOutput:
    polygons: List[Polygon]

    def __post_init__(self):
        for poly in self.polygons:
            if not isinstance(poly, Polygon):
                raise TypeError(f"Expected Polygon, got {type(poly)}")
