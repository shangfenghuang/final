import os, requests

from flask import Flask, session, request, render_template, redirect, url_for, jsonify, flash
from flask_session import Session
from sqlalchemy import create_engine, text
from sqlalchemy.orm import scoped_session, sessionmaker

app = Flask(__name__)

# # Check for environment variable
# if not os.getenv("DATABASE_URL"):
#     raise RuntimeError("DATABASE_URL is not set")
# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

engine = create_engine('postgresql://shangfeng:shangfeng@18.117.98.140:5432/final')
db = scoped_session(sessionmaker(bind=engine))


# db.init_app(app) ##tigh database to flask

@app.route("/")
def home():
    return render_template("Homepage.html")

@app.route("/contactus")
def contactus():
    return render_template("Contactus.html")

@app.route("/login")
def login():
    return render_template("Login.html")


@app.route("/register")
def register():
    return render_template("Register.html")

@app.route("/logout")
def logout():
    return render_template("Homepage.html")

@app.route("/registering", methods=["POST"])
def check_registration():
    email = request.form.get("email")
    session['email'] = None
    password = request.form.get("password")

    # if username == "" or password == "" or firstName == "" or lastName == "":
    #     return render_template("error.html",
    #                            message="One or more fields of the form is/are empty. Please return and fill in the form.",
    #                            type_error="registration")
    result = db.execute(text(f"SELECT * from users where email='{email}' "))
    if result.rowcount >= 1:
        flash("Email has alredy registerd")
        return redirect(url_for('register'))
    

    db.execute(text(f"INSERT INTO users (email, passwd) VALUES ('{email}', '{password}')"))
    
    db.commit()
    session['email'] = email
    flash("register succeed")
    return render_template("Login.html")

@app.route("/logining", methods=['POST'])
def logining():
    email = request.form.get('email')
    password = request.form.get('password')
    result = db.execute(text(f"SELECT * from users where email='{email}' AND passwd='{password}'"))
    if result.rowcount == 1:
        session['email'] = email
        flash("Logged in successfully.")
        return render_template('Frontend.html')
    flash("Error: email and password doesn't match.")
    return redirect(url_for('login'))


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
