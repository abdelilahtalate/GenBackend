from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from app.utils.decorators import token_required, handle_exceptions
from app.models import BackgroundTask
from app import db

tasks_bp = Blueprint('tasks', __name__, url_prefix='/api/tasks')

@tasks_bp.route('', methods=['POST'])
@token_required
@handle_exceptions
def create_task():
    """Create background task - MANUAL or AI-ASSISTED"""
    data = request.get_json()
    
    try:
        task = BackgroundTask(
            project_id=data.get('project_id'),
            task_type=data.get('task_type'),
            task_name=data.get('task_name'),
            payload=data.get('payload'),
            scheduled_for=data.get('scheduled_for')
        )
        
        db.session.add(task)
        db.session.commit()
        
        # TODO: Queue task with Celery
        
        return jsonify({'task': task.to_dict()}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@tasks_bp.route('/<int:task_id>', methods=['GET'])
@token_required
@handle_exceptions
def get_task(task_id):
    """Get task status - MANUAL"""
    task = BackgroundTask.query.get(task_id)
    
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    return jsonify({'task': task.to_dict()}), 200

@tasks_bp.route('/<int:task_id>/cancel', methods=['POST'])
@token_required
@handle_exceptions
def cancel_task(task_id):
    """Cancel task - MANUAL"""
    task = BackgroundTask.query.get(task_id)
    
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    if task.status in ['completed', 'failed']:
        return jsonify({'error': 'Cannot cancel completed or failed task'}), 400
    
    task.status = 'cancelled'
    db.session.commit()
    
    # TODO: Cancel Celery task
    
    return jsonify({'message': 'Task cancelled', 'task': task.to_dict()}), 200
