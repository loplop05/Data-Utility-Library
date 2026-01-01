from .base import BaseTools
from .io_tools import IOTools
from .eda import EDATools
from .missing import MissingTools
from .outliers import OutliersTools
from .encoding import EncodingTools
from .scaling import ScalingTools
from .features import FeatureTools
from .text_cleaning import TextCleaningTools
from .types_tools import TypeTools

class DataTools(
    BaseTools,
    IOTools,
    EDATools,
    MissingTools,
    OutliersTools,
    EncodingTools,
    ScalingTools,
    FeatureTools,
    TextCleaningTools,
    TypeTools
):
    """DataTools: One class that exposes all tools from all modules."""
    pass
