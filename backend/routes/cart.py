from flask import Blueprint, request, jsonify
from backend.models import CartItem, Product
from backend.db import db

cart_bp = Blueprint('cart', __name__)

@cart_bp.route('/api/cart/<int:user_id>', methods=['GET'])
def get_cart(user_id):
    items = CartItem.query.filter_by(user_id=user_id).all()
    result = []
    for item in items:
        product = Product.query.get(item.product_id)
        result.append({
            'id': item.id,
            'product_id': item.product_id,
            'name': product.name,
            'price': product.price,
            'quantity': item.quantity
        })
    return jsonify(result)

@cart_bp.route('/api/cart', methods=['POST'])
def add_to_cart():
    data = request.json
    item = CartItem.query.filter_by(user_id=data['user_id'], product_id=data['product_id']).first()
    if item:
        item.quantity += data.get('quantity', 1)
    else:
        item = CartItem(user_id=data['user_id'], product_id=data['product_id'], quantity=data.get('quantity', 1))
        db.session.add(item)
    db.session.commit()
    return jsonify({'message': 'Added to cart'})

@cart_bp.route('/api/cart/<int:item_id>', methods=['DELETE'])
def remove_from_cart(item_id):
    item = CartItem.query.get(item_id)
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Removed from cart'})