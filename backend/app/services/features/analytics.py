from .base import FeatureHandler
from app.models.test_record import TestRecord
from app import db
import statistics
import re
from collections import defaultdict

class AnalyticsHandler(FeatureHandler):
    """Handler for testing Advanced Data Aggregator (Simple, GroupBy & Custom SQL-like) in the wizard"""
    
    def handle(self, method, endpoint, body, schema, context=None):
        user_id = context.get('user_id', 'anon') if context else 'anon'
        project_id = context.get('project_id', 'default') if context else 'default'
        
        # We only support GET /api/analytics/summary (or similar)
        clean_endpoint = endpoint.strip('/')
        if 'summary' in clean_endpoint or 'stats' in clean_endpoint or method == 'GET':
            return self._handle_summary(user_id, project_id, schema)
            
        return {'error': 'Analytics endpoint not recognized or method not allowed', 'endpoint': endpoint}, 404

    def _handle_summary(self, user_id, project_id, schema):
        if not schema:
            return {'error': 'No configuration found for Analytics'}, 400
            
        reports = schema.get('reports', [])
        results = {}
        
        for report in reports:
            name = report.get('name', 'Report')
            entity = report.get('entity')
            mode = report.get('mode', 'simple')
            group_by = report.get('group_by')
            
            if not entity:
                continue
                
            # Construct the feature_id used by CRUDHandler for this entity
            crud_feature_id = f"crud_{user_id}_{entity}"
            
            # Query all records for this entity and project
            records = TestRecord.query.filter_by(feature_id=crud_feature_id, project_id=project_id).all()
            data_list = [r.data for r in records]
            
            if mode == 'advanced':
                expr = report.get('expression', '').lower()
                results[name] = self._evaluate_expression(expr, data_list)
            else:
                agg_type = report.get('type', 'count')
                field = report.get('field', 'id')
                
                if group_by:
                    results[name] = self._grouped_aggregate(agg_type, field, group_by, data_list)
                else:
                    results[name] = self._simple_aggregate(agg_type, field, data_list)
                    
        return results, 200

    def _simple_aggregate(self, agg_type, field, data_list):
        if agg_type == 'count':
            return len(data_list)
        
        # Extract numeric values for the specified field
        values = []
        for item in data_list:
            val = item.get(field)
            if isinstance(val, (int, float)):
                values.append(val)
        
        if not values:
            return 0
            
        if agg_type == 'sum':
            return sum(values)
        elif agg_type == 'avg':
            return sum(values) / len(values)
        elif agg_type == 'max':
            return max(values)
        elif agg_type == 'min':
            return min(values)
        return 0

    def _grouped_aggregate(self, agg_type, field, group_by_field, data_list):
        """Simulate SQL GROUP BY logic on mock data"""
        groups = defaultdict(list)
        for item in data_list:
            key = str(item.get(group_by_field, 'None'))
            groups[key].append(item)
        
        grouped_results = {}
        for key, group_items in groups.items():
            grouped_results[key] = self._simple_aggregate(agg_type, field, group_items)
            
        return grouped_results

    def _evaluate_expression(self, expr, data_list):
        """Mock SQL-like expression evaluator for the wizard testing phase"""
        if not expr: return 0
        
        try:
            # 1. Replace aggregation functions with their calculated values
            def replace_fn(match):
                fn = match.group(1)
                field = match.group(2)
                if field == '*' or not field: field = 'id'
                return str(self._simple_aggregate(fn, field, data_list))

            # Regex to find count(id), sum(price), etc.
            agg_pattern = r"(count|sum|avg|max|min)\s*\((.*?)\)"
            processed_expr = re.sub(agg_pattern, replace_fn, expr)
            
            # 2. Safety check: only allow numbers and basic operators
            if not re.match(r"^[\d\.\+\-\*\/\(\)\s]+$", processed_expr):
                return f"Error: Expression contains unsupported characters or functions"
                
            # 3. Use eval on the numerical expression
            return eval(processed_expr, {"__builtins__": None}, {})
        except Exception as e:
            return f"Error evaluating expression: {str(e)}"
