from airflow import DAG
from airflow.providers.google.cloud.operators.bigquery import BigQueryOperator
from airflow.operators.email import EmailOperator
from datetime import datetime, timedelta
from airflow.operators.python import PythonOperator
import pandas as pd
from google.cloud import bigquery

# Default arguments for the DAG
default_args = {
    'owner': 'SIR-Team',
    'depends_on_past': False,
    'email': ['your-team-email@shopify.com'],  # Replace with your team's email
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

# Create the DAG
dag = DAG(
    'stale_incidents_report',
    default_args=default_args,
    description='Weekly report of stale SIR incidents',
    schedule_interval='0 9 * * MON',  # Run at 9 AM every Monday
    start_date=datetime(2024, 1, 1),
    catchup=False,
    tags=['sir', 'incidents', 'report'],
)

# Function to format the email HTML
def format_email_html(**context):
    # Initialize BigQuery client
    client = bigquery.Client()

    # Query to get stale incidents
    query = """
    WITH stale_incidents AS (
        [Your query here]
    )
    SELECT * FROM stale_incidents
    ORDER BY days_since_update DESC;
    """
    
    # Run the query and get results
    df = client.query(query).to_dataframe()
    
    # Calculate summary statistics
    total_incidents = len(df)
    avg_days_stale = df['days_since_update'].mean()
    max_days_stale = df['days_since_update'].max()
    
    # Create HTML email content
    html_content = f"""
    <html>
    <head>
        <style>
            table {{
                border-collapse: collapse;
                width: 100%;
                margin-top: 20px;
            }}
            th, td {{
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }}
            th {{
                background-color: #f2f2f2;
            }}
            .summary {{
                margin-bottom: 20px;
                padding: 10px;
                background-color: #f9f9f9;
            }}
            .warning {{
                color: #cc0000;
            }}
        </style>
    </head>
    <body>
        <h2>Weekly Stale Incidents Report</h2>
        <div class="summary">
            <h3>Summary</h3>
            <p>Total stale incidents: <strong>{total_incidents}</strong></p>
            <p>Average days without update: <strong>{avg_days_stale:.1f}</strong></p>
            <p>Most stale incident: <strong>{max_days_stale}</strong> days</p>
        </div>
        
        <h3>Stale Incidents Details</h3>
        <table>
            <tr>
                <th>Incident ID</th>
                <th>Title</th>
                <th>Coordinators</th>
                <th>Created Date</th>
                <th>Last Updated</th>
                <th>Days Stale</th>
            </tr>
    """
    
    # Add rows to the table
    for _, row in df.iterrows():
        days_style = 'color: red;' if row['days_since_update'] > 14 else ''
        html_content += f"""
            <tr>
                <td><a href="{row['incident_link']}">{row['incident_id']}</a></td>
                <td>{row['title']}</td>
                <td>{row['coordinators']}</td>
                <td>{row['created_date']}</td>
                <td>{row['last_updated_date']}</td>
                <td style="{days_style}">{row['days_since_update']}</td>
            </tr>
        """
    
    html_content += """
        </table>
        <p style="margin-top: 20px;">
            This is an automated report. Please do not reply to this email.
        </p>
    </body>
    </html>
    """
    
    return html_content

# Task to format the email content
format_email_task = PythonOperator(
    task_id='format_email_content',
    python_callable=format_email_html,
    provide_context=True,
    dag=dag,
)

# Task to send the email
send_email_task = EmailOperator(
    task_id='send_email_report',
    to=['your-team-email@shopify.com'],  # Replace with your team's email
    subject='Weekly Stale Incidents Report',
    html_content="{{ task_instance.xcom_pull(task_ids='format_email_content') }}",
    dag=dag,
)

# Set task dependencies
format_email_task >> send_email_task 