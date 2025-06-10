from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from backend.db import db
from backend.models import User, Product, CartItem, Order
from backend.routes.auth import auth_bp
from backend.routes.products import products_bp
from backend.routes.cart import cart_bp
from backend.routes.orders import orders_bp

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://andrian:tonmotdepasse@localhost/selltronic'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
CORS(app)
db.init_app(app)

with app.app_context():
    db.create_all()

app.register_blueprint(auth_bp)
app.register_blueprint(products_bp)
app.register_blueprint(cart_bp)
app.register_blueprint(orders_bp)

if __name__ == '__main__':
    app.run(debug=True)

