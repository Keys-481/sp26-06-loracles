import inspect
import numpy as np
import pytest
from unittest.mock import patch
from src.inference.interface.base_models import BaseModel, LineSegmentationModel, HTRModel
from src.inference.interface.utils import LineSegmentationOutput, TextRecognitionOutput


def _make_concrete_base(**overrides):
    """Return a minimal concrete BaseModel subclass, with optional method overrides."""
    attrs = {
        "name": property(lambda self: "TestModel"),
        "description": property(lambda self: "A test model"),
        "user_options": property(lambda self: None),
        "advanced_user_options": property(lambda self: None),
        **overrides,
    }
    return type("ConcreteBase", (BaseModel,), attrs)


class TestBaseModel:

    def test_is_abstract(self):
        assert inspect.isabstract(BaseModel)

    def test_concrete_subclass_instantiates(self):
        model = _make_concrete_base()()
        assert isinstance(model, BaseModel)

    def test_abstract_members(self):
        abstract = {
            name for name, val in vars(BaseModel).items()
            if getattr(val, "__isabstractmethod__", False)
        }
        assert abstract == {"name", "description", "user_options", "advanced_user_options"}

    def test_missing_abstract_property_raises(self):
        Incomplete = type("Incomplete", (BaseModel,), {
            "name": property(lambda self: "test"),
        })
        with pytest.raises(TypeError):
            Incomplete()

    def test_device_cuda_when_available(self):
        Concrete = _make_concrete_base()
        with patch("src.inference.interface.base_models.is_available", return_value=True):
            assert Concrete().device == "cuda"

    def test_device_cpu_when_unavailable(self):
        Concrete = _make_concrete_base()
        with patch("src.inference.interface.base_models.is_available", return_value=False):
            assert Concrete().device == "cpu"


class TestLineSegmentationModel:

    def test_is_abstract(self):
        assert inspect.isabstract(LineSegmentationModel)

    def test_missing_call_raises(self):
        Incomplete = type("Incomplete", (LineSegmentationModel,), {
            "name": property(lambda self: "test"),
            "description": property(lambda self: "desc"),
            "user_options": property(lambda self: None),
            "advanced_user_options": property(lambda self: None),
        })
        with pytest.raises(TypeError):
            Incomplete()

    def test_concrete_subclass_instantiates(self):
        class Concrete(LineSegmentationModel):
            @property
            def name(self): return "test"

            @property
            def description(self): return "desc"

            @property
            def user_options(self): return None

            @property
            def advanced_user_options(self): return None

            def __call__(self, images: list[np.ndarray]) -> LineSegmentationOutput:
                return LineSegmentationOutput(polygons=[], image_path="")

        model = Concrete()
        assert isinstance(model, LineSegmentationModel)
        assert isinstance(model, BaseModel)

    def test_concrete_subclass_callable(self):
        class Concrete(LineSegmentationModel):
            @property
            def name(self): return "test"

            @property
            def description(self): return "desc"

            @property
            def user_options(self): return None

            @property
            def advanced_user_options(self): return None

            def __call__(self, images: list[np.ndarray]) -> LineSegmentationOutput:
                return LineSegmentationOutput(polygons=[], image_path="")

        output = Concrete()(images=[])
        assert isinstance(output, LineSegmentationOutput)


class TestHTRModel:

    def test_is_abstract(self):
        assert inspect.isabstract(HTRModel)

    def test_missing_call_raises(self):
        Incomplete = type("Incomplete", (HTRModel,), {
            "name": property(lambda self: "test"),
            "description": property(lambda self: "desc"),
            "user_options": property(lambda self: None),
            "advanced_user_options": property(lambda self: None),
        })
        with pytest.raises(TypeError):
            Incomplete()

    def test_concrete_subclass_instantiates(self):
        class Concrete(HTRModel):
            @property
            def name(self): return "test"

            @property
            def description(self): return "desc"

            @property
            def user_options(self): return None

            @property
            def advanced_user_options(self): return None

            def __call__(self, images, polygons):
                return []

        model = Concrete()
        assert isinstance(model, HTRModel)
        assert isinstance(model, BaseModel)

    def test_concrete_subclass_callable(self):
        class Concrete(HTRModel):
            @property
            def name(self): return "test"

            @property
            def description(self): return "desc"

            @property
            def user_options(self): return None

            @property
            def advanced_user_options(self): return None

            def __call__(self, images, polygons):
                return [TextRecognitionOutput(annotations=[], image_path="")]

        output = Concrete()(images=[], polygons=[])
        assert isinstance(output, list)
        assert isinstance(output[0], TextRecognitionOutput)
