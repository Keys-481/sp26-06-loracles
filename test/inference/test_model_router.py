import shutil
import types
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from src.inference.interface.base_models import BaseModel, LineSegmentationModel
from src.inference.interface.utils import LineSegmentationOutput
from src.inference.model_router import ModelRouter


def _make_concrete_cls(name="ConcreteModel"):
    """Return a minimal concrete LineSegmentationModel subclass."""

    class ConcreteModel(LineSegmentationModel):
        @property
        def name(self): return name

        @property
        def description(self): return "test"

        @property
        def user_options(self): return None

        @property
        def advanced_user_options(self): return None

        def __call__(self, images): return LineSegmentationOutput(polygons=[])

    ConcreteModel.__name__ = name
    return ConcreteModel


def _make_mock_module(module_name: str, *classes):
    """Return a types.ModuleType whose __name__ is module_name and that contains each class."""
    mod = types.ModuleType(module_name)
    mod.__name__ = module_name
    for cls in classes:
        cls.__module__ = module_name
        setattr(mod, cls.__name__, cls)
    return mod


def _router_with_models(models: dict) -> ModelRouter:
    """Construct a ModelRouter that bypasses discover() and uses the given models dict."""
    router = ModelRouter.__new__(ModelRouter)
    router.models_dir = Path("/fake/models")
    router.models = models
    return router


class TestModelRouterDiscover:

    def test_nonexistent_dir_returns_empty(self, tmp_path):
        result = ModelRouter.discover(tmp_path / "nonexistent")
        assert result == {}

    def test_empty_dir_returns_empty(self, tmp_path):
        models_dir = tmp_path / "models"
        models_dir.mkdir()
        assert ModelRouter.discover(models_dir) == {}

    def test_skips_files_at_top_level(self, tmp_path):
        models_dir = tmp_path / "models"
        models_dir.mkdir()
        (models_dir / "somefile.py").touch()
        assert ModelRouter.discover(models_dir) == {}

    def test_skips_dir_without_matching_module_file(self, tmp_path):
        models_dir = tmp_path / "models"
        (models_dir / "ModelA").mkdir(parents=True)
        # No modela.py inside ModelA
        assert ModelRouter.discover(models_dir) == {}

    def test_skips_dir_with_wrong_module_filename(self, tmp_path):
        models_dir = tmp_path / "models"
        model_dir = models_dir / "ModelA"
        model_dir.mkdir(parents=True)
        (model_dir / "wrong.py").touch()  # expected: modela.py
        assert ModelRouter.discover(models_dir) == {}

    def test_discovers_valid_model(self, tmp_path):
        models_dir = tmp_path / "models"
        model_dir = models_dir / "ModelA"
        model_dir.mkdir(parents=True)
        (model_dir / "modela.py").touch()

        module_name = "models.ModelA.modela"
        Cls = _make_concrete_cls("Cls")
        mock_mod = _make_mock_module(module_name, Cls)

        with patch("importlib.import_module", return_value=mock_mod):
            result = ModelRouter.discover(models_dir)

        assert "ModelA" in result
        assert result["ModelA"] is Cls

    def test_skips_failed_import(self, tmp_path, capsys):
        models_dir = tmp_path / "models"
        model_dir = models_dir / "ModelA"
        model_dir.mkdir(parents=True)
        (model_dir / "modela.py").touch()

        with patch("importlib.import_module", side_effect=ImportError("boom")):
            result = ModelRouter.discover(models_dir)

        assert result == {}
        assert "Warning" in capsys.readouterr().out

    def test_skips_abstract_subclass(self, tmp_path):
        models_dir = tmp_path / "models"
        model_dir = models_dir / "ModelA"
        model_dir.mkdir(parents=True)
        (model_dir / "modela.py").touch()

        module_name = "models.ModelA.modela"
        # Create a subclass that is still abstract (missing __call__)
        AbstractSub = type("AbstractSub", (LineSegmentationModel,), {
            "__module__": module_name,
            "name": property(lambda self: "abstract"),
            "description": property(lambda self: "desc"),
            "user_options": property(lambda self: None),
            "advanced_user_options": property(lambda self: None),
        })
        mock_mod = types.ModuleType(module_name)
        mock_mod.__name__ = module_name
        mock_mod.AbstractSub = AbstractSub

        with patch("importlib.import_module", return_value=mock_mod):
            result = ModelRouter.discover(models_dir)

        assert result == {}

    def test_skips_base_model_itself(self, tmp_path):
        models_dir = tmp_path / "models"
        model_dir = models_dir / "ModelA"
        model_dir.mkdir(parents=True)
        (model_dir / "modela.py").touch()

        module_name = "models.ModelA.modela"
        mock_mod = types.ModuleType(module_name)
        mock_mod.__name__ = module_name
        # Put BaseModel in the mock module but as itself (obj is not BaseModel check)
        mock_mod.BaseModel = BaseModel

        with patch("importlib.import_module", return_value=mock_mod):
            result = ModelRouter.discover(models_dir)

        assert result == {}

    def test_skips_class_from_different_module(self, tmp_path):
        models_dir = tmp_path / "models"
        model_dir = models_dir / "ModelA"
        model_dir.mkdir(parents=True)
        (model_dir / "modela.py").touch()

        module_name = "models.ModelA.modela"
        Cls = _make_concrete_cls("Cls")
        # __module__ is set to the test file, not module_name

        mock_mod = types.ModuleType(module_name)
        mock_mod.__name__ = module_name
        mock_mod.Cls = Cls  # Don't update Cls.__module__

        with patch("importlib.import_module", return_value=mock_mod):
            result = ModelRouter.discover(models_dir)

        assert result == {}

    def test_discovers_multiple_models(self, tmp_path):
        models_dir = tmp_path / "models"
        for dir_name in ("ModelA", "ModelB"):
            d = models_dir / dir_name
            d.mkdir(parents=True)
            (d / f"{dir_name.lower()}.py").touch()

        name_a = "models.ModelA.modela"
        name_b = "models.ModelB.modelb"
        ClsA = _make_concrete_cls("ClsA")
        ClsB = _make_concrete_cls("ClsB")
        mod_a = _make_mock_module(name_a, ClsA)
        mod_b = _make_mock_module(name_b, ClsB)

        def fake_import(name, *args, **kwargs):
            if "ModelA" in name:
                return mod_a
            if "ModelB" in name:
                return mod_b
            raise ImportError(f"no module {name}")

        with patch("importlib.import_module", side_effect=fake_import):
            result = ModelRouter.discover(models_dir)

        assert set(result.keys()) == {"ModelA", "ModelB"}
        assert result["ModelA"] is ClsA
        assert result["ModelB"] is ClsB

    def test_one_bad_import_does_not_block_others(self, tmp_path):
        models_dir = tmp_path / "models"
        for dir_name in ("BadModel", "GoodModel"):
            d = models_dir / dir_name
            d.mkdir(parents=True)
            (d / f"{dir_name.lower()}.py").touch()

        good_name = "models.GoodModel.goodmodel"
        ClsGood = _make_concrete_cls("ClsGood")
        mod_good = _make_mock_module(good_name, ClsGood)

        def fake_import(name, *args, **kwargs):
            if "BadModel" in name:
                raise RuntimeError("bad import")
            return mod_good

        with patch("importlib.import_module", side_effect=fake_import):
            result = ModelRouter.discover(models_dir)

        assert "GoodModel" in result
        assert "BadModel" not in result

    def test_models_are_sorted_by_dir_name(self, tmp_path):
        models_dir = tmp_path / "models"
        for dir_name in ("ZModel", "AModel", "MModel"):
            d = models_dir / dir_name
            d.mkdir(parents=True)
            (d / f"{dir_name.lower()}.py").touch()

        def make_mod(dir_name):
            n = f"models.{dir_name}.{dir_name.lower()}"
            Cls = _make_concrete_cls(f"Cls_{dir_name}")
            return _make_mock_module(n, Cls)

        modules = {n: make_mod(n) for n in ("ZModel", "AModel", "MModel")}

        def fake_import(name, *args, **kwargs):
            for key, mod in modules.items():
                if key in name:
                    return mod
            raise ImportError(name)

        with patch("importlib.import_module", side_effect=fake_import):
            result = ModelRouter.discover(models_dir)

        assert list(result.keys()) == sorted(result.keys())


class TestModelRouterCall:

    def test_returns_tuple_when_both_found(self):
        ClsA = _make_concrete_cls("ClsA")
        ClsB = _make_concrete_cls("ClsB")
        router = _router_with_models({"seg": ClsA, "htr": ClsB})
        assert router("seg", "htr") == (ClsA, ClsB)

    def test_raises_on_missing_seg_model(self):
        ClsB = _make_concrete_cls("ClsB")
        router = _router_with_models({"htr": ClsB})
        with pytest.raises(ValueError, match="missing_seg"):
            router("missing_seg", "htr")

    def test_raises_on_missing_htr_model(self):
        ClsA = _make_concrete_cls("ClsA")
        router = _router_with_models({"seg": ClsA})
        with pytest.raises(ValueError, match="missing_htr"):
            router("seg", "missing_htr")

    def test_error_message_includes_model_name(self):
        router = _router_with_models({})
        with pytest.raises(ValueError, match="my_seg_model"):
            router("my_seg_model", "htr")

    def test_raises_on_both_missing(self):
        router = _router_with_models({})
        with pytest.raises(ValueError):
            router("seg", "htr")

    def test_same_model_for_both_roles(self):
        Cls = _make_concrete_cls("Cls")
        router = _router_with_models({"model": Cls})
        assert router("model", "model") == (Cls, Cls)


class TestModelRouterInit:

    def test_stores_models_dir(self, tmp_path):
        models_dir = tmp_path / "models"
        models_dir.mkdir()
        router = ModelRouter(models_dir)
        assert router.models_dir == models_dir

    def test_calls_discover_on_init(self, tmp_path):
        models_dir = tmp_path / "models"
        models_dir.mkdir()
        sentinel = {"fake": MagicMock()}
        with patch.object(ModelRouter, "discover", return_value=sentinel) as mock_discover:
            router = ModelRouter(models_dir)
            mock_discover.assert_called_once_with(models_dir)
            assert router.models is sentinel

    def test_models_is_dict(self, tmp_path):
        models_dir = tmp_path / "models"
        models_dir.mkdir()
        router = ModelRouter(models_dir)
        assert isinstance(router.models, dict)


class TestModelRouterUpdateModels:

    def test_update_picks_up_new_model(self, tmp_path):
        models_dir = tmp_path / "models"
        models_dir.mkdir()

        router = ModelRouter(models_dir)
        assert router.models == {}

        # Add a model directory after construction
        model_dir = models_dir / "ModelA"
        model_dir.mkdir()
        (model_dir / "modela.py").touch()

        module_name = "models.ModelA.modela"
        Cls = _make_concrete_cls("Cls")
        mock_mod = _make_mock_module(module_name, Cls)

        with patch("importlib.import_module", return_value=mock_mod):
            router.update_models()

        assert "ModelA" in router.models

    def test_update_removes_deleted_model(self, tmp_path):
        models_dir = tmp_path / "models"
        model_dir = models_dir / "ModelA"
        model_dir.mkdir(parents=True)
        (model_dir / "modela.py").touch()

        module_name = "models.ModelA.modela"
        Cls = _make_concrete_cls("Cls")
        mock_mod = _make_mock_module(module_name, Cls)

        with patch("importlib.import_module", return_value=mock_mod):
            router = ModelRouter(models_dir)
        assert "ModelA" in router.models

        shutil.rmtree(str(model_dir))
        router.update_models()
        assert "ModelA" not in router.models

    def test_update_uses_same_models_dir(self, tmp_path):
        models_dir = tmp_path / "models"
        models_dir.mkdir()

        router = ModelRouter(models_dir)
        with patch.object(ModelRouter, "discover", return_value={}) as mock_discover:
            router.update_models()
            mock_discover.assert_called_once_with(models_dir)
