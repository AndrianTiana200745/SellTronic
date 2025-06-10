from flask import Blueprint, request, jsonify
from backend.models import Order, CartItem, Product
from backend.db import db

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/api/orders', methods=['POST'])
def place_order():
    data = request.json
    user_id = data['user_id']
    items = CartItem.query.filter_by(user_id=user_id).all()
    if not items:
        return jsonify({'error': 'Cart is empty'}), 400
    total = sum(Product.query.get(item.product_id).price * item.quantity for item in items)
    order = Order(user_id=user_id, total=total, status='pending')
    db.session.add(order)
    CartItem.query.filter_by(user_id=user_id).delete()
    db.session.commit()
    return jsonify({'message': 'Order placed', 'order_id': order.id})

@orders_bp.route('/api/orders/<int:user_id>', methods=['GET'])
def get_orders(user_id):
    orders = Order.query.filter_by(user_id=user_id).all()
    return jsonify([{'id': o.id, 'total': o.total, 'status': o.status} for o in orders])