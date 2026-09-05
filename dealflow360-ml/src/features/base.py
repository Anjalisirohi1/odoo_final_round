from abc import ABC, abstractmethod
import pandas as pd
from typing import Dict

class BaseFeatureBuilder(ABC):
    @abstractmethod
    def build_features(self, datasets: Dict[str, pd.DataFrame]) -> pd.DataFrame:
        """
        Builds and returns a feature DataFrame from the provided datasets.
        """
        pass
