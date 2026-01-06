from app import db

class AnalyticsService:
    """Analytics and aggregation service"""
    
    @staticmethod
    def aggregate_data(table_name: str, metric: str, group_by: str = None) -> dict:
        """Calculate aggregates (SUM, AVG, COUNT) - MANUAL or AI-GENERATED"""
        try:
            metric_upper = metric.upper()
            
            if group_by:
                query = f"SELECT {group_by}, {metric_upper}(*) as result FROM {table_name} GROUP BY {group_by}"
            else:
                query = f"SELECT {metric_upper}(*) as result FROM {table_name}"
            
            result = db.session.execute(query)
            data = result.fetchall()
            
            return {'metric': metric, 'data': data}, 200
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_statistics(table_name: str) -> dict:
        """Get table statistics - MANUAL"""
        try:
            stats = {
                'total_records': db.session.execute(f"SELECT COUNT(*) FROM {table_name}").scalar(),
                'total_size': db.session.execute(f"SELECT pg_total_relation_size('{table_name}')").scalar()
            }
            return {'statistics': stats}, 200
        except Exception as e:
            return {'error': str(e)}, 500
