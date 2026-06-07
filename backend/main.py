from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from database import supabase
from auth import hash_password, verify_password, create_token, verify_token
from typing import Optional
import os, uuid
import random
from datetime import datetime, timedelta

# OTP temporary store
otp_store = {}

def generate_otp():
    return str(random.randint(100000, 999999))

# ── APP SETUP ─────────────────────────────────────────────────
app = FastAPI(title="DeepSense API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        payload = verify_token(credentials.credentials)
        print(f"Token OK: {payload}")
        return payload
    except Exception as e:
        print(f"Token FAILED: {e}")
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

# ── MODELS ────────────────────────────────────────────────────
class RegisterModel(BaseModel):
    full_name: str
    email: str
    password: str
    role: str
    license_number: Optional[str] = None

class LoginModel(BaseModel):
    email: str
    password: str

class PatientModel(BaseModel):
    full_name: str
    email: Optional[str] = None
    date_of_birth: Optional[str] = None

class AppointmentModel(BaseModel):
    patient_id: str
    appointment_date: str
    time_slot: str
    reason: Optional[str] = None

class SendOTPModel(BaseModel):
    email: str
    full_name: str
    password: str
    role: str

class VerifyOTPModel(BaseModel):
    email: str
    otp: str

# ── ROOT ──────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"message": "DeepSense API Running!"}

# ── AUTH ROUTES ───────────────────────────────────────────────
@app.post("/register")
async def register(data: RegisterModel):
    try:
        existing = supabase.table("users")\
            .select("id").eq("email", data.email).execute()
        if existing.data:
            raise HTTPException(400, "Email already exists")
        hashed = hash_password(data.password)
        result = supabase.table("users").insert({
            "full_name": data.full_name,
            "email": data.email,
            "password": hashed,
            "role": data.role,
            "license_number": data.license_number
        }).execute()
        user = result.data[0]
        token = create_token({"user_id": user["id"], "role": user["role"]})
        return {"message": "Success", "token": token, "user": user}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post("/login")
async def login(data: LoginModel):
    try:
        result = supabase.table("users")\
            .select("*").eq("email", data.email).execute()
        if not result.data:
            raise HTTPException(401, "Invalid credentials")
        user = result.data[0]
        if not verify_password(data.password, user["password"]):
            raise HTTPException(401, "Invalid credentials")
        token = create_token({"user_id": user["id"], "role": user["role"]})
        return {"message": "Success", "token": token, "user": user}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))

@app.get("/me")
async def get_me(user=Depends(get_current_user)):
    result = supabase.table("users")\
        .select("id,full_name,email,role")\
        .eq("id", user["user_id"]).execute()
    return result.data[0]

# ── OTP ROUTES ────────────────────────────────────────────────
@app.post("/send-otp")
async def send_otp(data: SendOTPModel):
    try:
        existing = supabase.table("users")\
            .select("id").eq("email", data.email).execute()
        if existing.data:
            raise HTTPException(400, "Email already registered")

        otp = generate_otp()
        otp_store[data.email] = {
            "otp":      otp,
            "expires":  datetime.utcnow() + timedelta(minutes=10),
            "name":     data.full_name,
            "password": data.password,
            "role":     data.role,
        }

        print(f"✅ OTP for {data.email} : {otp}")
        return {"message": "OTP sent!", "otp": otp}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post("/verify-otp")
async def verify_otp(data: VerifyOTPModel):
    try:
        stored = otp_store.get(data.email)
        if not stored:
            raise HTTPException(400, "OTP not found — request again")
        if datetime.utcnow() > stored["expires"]:
            del otp_store[data.email]
            raise HTTPException(400, "OTP expired — request again")
        if stored["otp"] != data.otp:
            raise HTTPException(400, "Invalid OTP")

        hashed = hash_password(stored["password"])
        result = supabase.table("users").insert({
            "full_name": stored["name"],
            "email":     data.email,
            "password":  hashed,
            "role":      stored["role"],
        }).execute()

        del otp_store[data.email]
        user  = result.data[0]
        token = create_token({"user_id": user["id"], "role": user["role"]})
        return {"message": "Verified!", "token": token, "user": user}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))

# ── PATIENT ROUTES ────────────────────────────────────────────
@app.get("/patients")
async def get_patients(user=Depends(get_current_user)):
    result = supabase.table("patients")\
        .select("*").eq("admin_id", user["user_id"]).execute()
    return result.data

@app.post("/patients")
async def add_patient(data: PatientModel, user=Depends(get_current_user)):
    result = supabase.table("patients").insert({
        "admin_id": user["user_id"],
        "full_name": data.full_name,
        "email": data.email,
        "date_of_birth": data.date_of_birth
    }).execute()
    return result.data[0]

@app.get("/patients/{patient_id}")
async def get_patient(patient_id: str, user=Depends(get_current_user)):
    result = supabase.table("patients")\
        .select("*").eq("id", patient_id).execute()
    return result.data[0]

# ── REPORT ROUTES ─────────────────────────────────────────────
@app.get("/reports")
async def get_reports(user=Depends(get_current_user)):
    result = supabase.table("xray_reports")\
        .select("*, patients(full_name)").execute()
    return result.data

@app.get("/reports/{patient_id}")
async def get_patient_reports(patient_id: str, user=Depends(get_current_user)):
    result = supabase.table("xray_reports")\
        .select("*").eq("patient_id", patient_id).execute()
    return result.data

@app.get("/my-reports")
async def get_my_reports(user=Depends(get_current_user)):
    result = supabase.table("xray_reports")\
        .select("*").eq("patient_id", user["user_id"]).execute()
    return result.data

# ── APPOINTMENT ROUTES ────────────────────────────────────────
@app.get("/appointments")
async def get_appointments(user=Depends(get_current_user)):
    if user["role"] == "admin":
        result = supabase.table("appointments")\
            .select("*, patients(full_name)")\
            .eq("admin_id", user["user_id"]).execute()
    else:
        result = supabase.table("appointments")\
            .select("*")\
            .eq("patient_id", user["user_id"]).execute()
    return result.data

@app.post("/appointments")
async def book_appointment(data: AppointmentModel, user=Depends(get_current_user)):
    result = supabase.table("appointments").insert({
        "patient_id": data.patient_id,
        "admin_id": user["user_id"],
        "appointment_date": data.appointment_date,
        "time_slot": data.time_slot,
        "reason": data.reason,
        "status": "booked"
    }).execute()
    return result.data[0]

# ── AI ANALYZE ROUTE ──────────────────────────────────────────
@app.post("/analyze")
async def analyze_xray(
    file: UploadFile = File(...),
    patient_id: str = None,
    user=Depends(get_current_user)
):
    try:
        import torch
        import torchvision.transforms as transforms
        from PIL import Image
        from model import DeepSenseV2
        import io

        classes = ['Caries', 'Bone Loss', 'Fracture', 'Impacted Teeth']

        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert('RGB')

        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
        img_tensor = transform(img).unsqueeze(0)

        model = DeepSenseV2(num_classes=4)
        model.load_state_dict(torch.load(
            os.path.join(os.path.dirname(__file__), 'deepsense_best.pth'),
            map_location=torch.device('cpu')
        ))
        model.eval()

        with torch.no_grad():
            output = model(img_tensor)
            probs = torch.softmax(output, dim=1)[0]

        findings = {classes[i]: float(probs[i]) for i in range(len(classes))}
        detected = max(findings, key=findings.get)

        nlp_report = f"""
DeepSense AI Dental Analysis Report
=====================================
Primary Finding: {detected}
Confidence: {findings[detected]*100:.1f}%

Analysis Summary:
- {detected} detected with high confidence
- Immediate clinical evaluation recommended
- Follow-up X-ray advised in 3 months

All Findings:
""" + "\n".join([f"- {k}: {v*100:.1f}%" for k, v in findings.items()])

        if patient_id:
            supabase.table("xray_reports").insert({
                "patient_id": patient_id,
                "findings": findings,
                "confidence_scores": findings,
                "nlp_report": nlp_report
            }).execute()

        return {
            "detected": detected,
            "confidence": findings[detected],
            "all_findings": findings,
            "nlp_report": nlp_report
        }

    except Exception as e:
        print(f"Analyze error: {e}")
        raise HTTPException(500, str(e))