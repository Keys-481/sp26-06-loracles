import pytest
from src.inference.interface.utils import LineSegmentationOutput, Polygon, PolygonPoint


class TestPolygonPoint:

    def test_create(self):
        pt = PolygonPoint(x=10, y=20)
        assert pt.x == 10
        assert pt.y == 20

    def test_positional_args(self):
        pt = PolygonPoint(5, 15)
        assert pt.x == 5
        assert pt.y == 15

    def test_is_named_tuple(self):
        pt = PolygonPoint(0, 0)
        assert isinstance(pt, tuple)


class TestPolygon:

    def test_create_empty(self):
        poly = Polygon(points=[])
        assert poly.points == []

    def test_create_with_points(self):
        pts = [PolygonPoint(0, 0), PolygonPoint(1, 2)]
        poly = Polygon(points=pts)
        assert poly.points == pts

    def test_is_named_tuple(self):
        poly = Polygon(points=[])
        assert isinstance(poly, tuple)


class TestLineSegmentationOutput:

    def test_create_empty(self):
        output = LineSegmentationOutput(polygons=[])
        assert output.polygons == []

    def test_create_with_polygon(self):
        poly = Polygon(points=[PolygonPoint(0, 0), PolygonPoint(1, 1)])
        output = LineSegmentationOutput(polygons=[poly])
        assert len(output.polygons) == 1
        assert output.polygons[0] is poly

    def test_create_with_multiple_polygons(self):
        polys = [Polygon(points=[PolygonPoint(i, i)]) for i in range(3)]
        output = LineSegmentationOutput(polygons=polys)
        assert len(output.polygons) == 3

    def test_rejects_non_polygon(self):
        with pytest.raises(TypeError):
            LineSegmentationOutput(polygons=["not a polygon"])

    def test_rejects_mixed_list(self):
        poly = Polygon(points=[])
        with pytest.raises(TypeError):
            LineSegmentationOutput(polygons=[poly, "bad"])
