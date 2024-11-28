from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///finance.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    transaction_type = db.Column(db.String(10), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.String(10), nullable=False)

@app.route('/transactions', methods=['POST'])
def create_transaction():
    data = request.json
    if not data or any(key not in data for key in ['type', 'category', 'amount', 'date']):
        return jsonify({'error': 'Invalid input data'}), 400
    new_transaction = Transaction(
        transaction_type=data['type'],
        category=data['category'],
        amount=data['amount'],
        date=data['date']
    )
    db.session.add(new_transaction)
    db.session.commit()
    return jsonify({'message': 'Transaction created!'}), 201

@app.route('/transactions', methods=['GET'])
def get_transactions():
    transactions = Transaction.query.all()
    return jsonify([{
        'id': t.id,
        'type': t.transaction_type,
        'category': t.category,
        'amount': t.amount,
        'date': t.date
    } for t in transactions])

@app.route('/transactions/<int:id>', methods=['PUT'])
def update_transaction(id):
    transaction = Transaction.query.get_or_404(id)
    data = request.json
    if not data or any(key not in data for key in ['type', 'category', 'amount', 'date']):
        return jsonify({'error': 'Invalid input data'}), 400
    transaction.transaction_type = data['type']
    transaction.category = data['category']
    transaction.amount = data['amount']
    transaction.date = data['date']
    db.session.commit()
    return jsonify({'message': 'Transaction updated!'})

@app.route('/transactions/<int:id>', methods=['DELETE'])
def delete_transaction(id):
    transaction = Transaction.query.get_or_404(id)
    db.session.delete(transaction)
    db.session.commit()
    return jsonify({'message': 'Transaction deleted!'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Initialize the database tables before running the app
    app.run(debug=True)
