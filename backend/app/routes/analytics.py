from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from app.utils.decorators import token_required, handle_exceptions
from app.services.analytics_service import AnalyticsService

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')

@analytics_bp.route('/aggregate', methods=['POST'])
@token_required
@handle_exceptions
def aggregate():
    """Calculate aggregates (SUM, AVG, COUNT) - MANUAL or AI-GENERATED"""
    data = request.get_json()
    
    result, status = AnalyticsService.aggregate_data(
        data.get('table_name'),
        data.get('metric'),
        data.get('group_by')
    )
    return jsonify(result), status

@analytics_bp.route('/statistics/<table_name>', methods=['GET'])
@token_required
@handle_exceptions
def statistics(table_name):
    """Get table statistics - MANUAL"""
    result, status = AnalyticsService.get_statistics(table_name)
    return jsonify(result), status
