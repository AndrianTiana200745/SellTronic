from flask import Blueprint, request, jsonify
from backend.models import User
from backend.db import db
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/register', methods=['POST'])
def register():
    data = request.json
    email = data['email'].lower()
    name = data.get('name')
    if not name:
        return jsonify({'error': 'Le nom est requis'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'User exists'}), 400
    role = data.get('role', 'buyer')  # 'buyer' par défaut
    user = User(
        name=name,
        email=email,
        password=generate_password_hash(data['password']),
        role=role
    )
    try:
        db.session.add(user)
        db.session.commit()
        return jsonify({'message': 'User registered'})
    except Exception as e:
        db.session.rollback()
        print("Erreur lors de l'inscription :", e)
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data['email'].lower()
    password = data['password']
    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password, password):
        return jsonify({
            "message": "Login successful",
            "id": user.id,  # <--- ajoute ceci
            "role": user.role,
            "name": user.name,
            "email": user.email
        })
    return jsonify({"error": "Invalid credentials"}), 401

@auth_bp.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    users_data = [
        {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "name": user.name
        }
        for user in users
    ]
    return jsonify({"users": users_data})
