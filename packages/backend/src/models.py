from pydantic import BaseModel, Field
from typing import List
from datetime import datetime

class BundleRequest(BaseModel):
    policy_id: str = Field(..., min_length=56, max_length=56, description="Cardano policy id (hex)")

class GraphNode(BaseModel):
    id: str
    group: str
    color: str
    val: float = Field(default=1.0)

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class BundleRequest(BaseModel):
    policy_id: str = Field(..., min_length=56, max_length=56, description="Cardano policy id (hex)")

class GraphNode(BaseModel):
    id: str
    group: str
    color: str
    val: float = Field(default=1.0)

class GraphLink(BaseModel):
    source: str
    target: str

class BundleAnalysisResult(BaseModel):
    policy_id: str
    nodes: List[GraphNode]
    links: List[GraphLink]
    risk_score: int = Field(0, ge=0, le=100)
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class PolicyAnalysisResult(BaseModel):
    policy_id: str
    type: str
    risk_level: str
    risk_score: int = Field(0, ge=0, le=100)
    details: Dict = {}
    explanation: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    cached: bool = False
