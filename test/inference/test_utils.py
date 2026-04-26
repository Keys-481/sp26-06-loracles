import pytest
from src.inference.interface.utils import LineSegmentationOutput, Polygon, PolygonPoint, TextAnnotation, TextRecognitionOutput


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
        output = LineSegmentationOutput(polygons=[], image_path="")
        assert output.polygons == []

    def test_create_with_polygon(self):
        poly = Polygon(points=[PolygonPoint(0, 0), PolygonPoint(1, 1)])
        output = LineSegmentationOutput(polygons=[poly], image_path="")
        assert len(output.polygons) == 1
        assert output.polygons[0] is poly

    def test_create_with_multiple_polygons(self):
        polys = [Polygon(points=[PolygonPoint(i, i)]) for i in range(3)]
        output = LineSegmentationOutput(polygons=polys, image_path="")
        assert len(output.polygons) == 3

    def test_rejects_non_polygon(self):
        with pytest.raises(TypeError):
            LineSegmentationOutput(polygons=["not a polygon"], image_path="")

    def test_rejects_mixed_list(self):
        poly = Polygon(points=[])
        with pytest.raises(TypeError):
            LineSegmentationOutput(polygons=[poly, "bad"], image_path="")


class TestTextAnnotation:

    def test_create(self):
        poly = Polygon(points=[PolygonPoint(0, 0), PolygonPoint(10, 20)])
        ann = TextAnnotation(text="hello", polygon=poly)
        assert ann.text == "hello"
        assert ann.polygon is poly

    def test_positional_args(self):
        poly = Polygon(points=[PolygonPoint(1, 2)])
        ann = TextAnnotation("world", poly)
        assert ann.text == "world"
        assert ann.polygon is poly

    def test_is_named_tuple(self):
        poly = Polygon(points=[])
        ann = TextAnnotation(text="", polygon=poly)
        assert isinstance(ann, tuple)


class TestTextRecognitionOutput:

    def test_create_empty(self):
        output = TextRecognitionOutput(annotations=[], image_path="")
        assert output.annotations == []

    def test_create_with_annotation(self):
        poly = Polygon(points=[PolygonPoint(0, 0)])
        ann = TextAnnotation(text="line", polygon=poly)
        output = TextRecognitionOutput(annotations=[ann], image_path="")
        assert len(output.annotations) == 1
        assert output.annotations[0] is ann

    def test_create_with_multiple_annotations(self):
        poly = Polygon(points=[PolygonPoint(0, 0)])
        anns = [TextAnnotation(text=str(i), polygon=poly) for i in range(3)]
        output = TextRecognitionOutput(annotations=anns, image_path="")
        assert len(output.annotations) == 3

    def test_rejects_non_annotation(self):
        with pytest.raises(TypeError):
            TextRecognitionOutput(annotations=["not an annotation"], image_path="")

    def test_rejects_mixed_list(self):
        poly = Polygon(points=[])
        ann = TextAnnotation(text="ok", polygon=poly)
        with pytest.raises(TypeError):
            TextRecognitionOutput(annotations=[ann, "bad"], image_path="")
