
try:
    print("Importing app package...")
    import app
    print("Importing db from app...")
    from app import db
    print("Importing TestRecord...")
    from app.models.test_record import TestRecord
    print("Success!")
except Exception as e:
    import traceback
    traceback.print_exc()
