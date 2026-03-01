from abc import ABC, abstractmethod
from typing import Dict, List

import numpy as np
from torch.cuda import is_available

from .utils import LineSegmentationOutput


class BaseModel(ABC):
    @property
    def device(self): return 'cuda' if is_available() else 'cpu'

    @property
    @abstractmethod
    def name(self) -> str: pass

    @property
    @abstractmethod
    def description(self) -> str: pass

    @property
    @abstractmethod
    def user_options(self) -> Dict[str, int | float | str] | None: pass

    @property
    @abstractmethod
    def advanced_user_options(self) -> Dict[str, int | float | str] | None: pass


class LineSegmentationModel(BaseModel):
    @abstractmethod
    def __call__(self, images: List[np.ndarray]) -> LineSegmentationOutput: pass
