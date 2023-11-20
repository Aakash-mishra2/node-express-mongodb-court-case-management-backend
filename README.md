# CCMS-Backend Node Backend

## File Tree
```
📦Court Case Management System-backend
 ┣ 📜app.js         // root of all components, API routes and server entry point
 📦controllers      // javascript callback functions to execute commands over api requests
 ┣ 📜admin-routes-controller     
 ┗ 📜citizen-routes-controller
 📦models           //schemas for collections and relations in mongodb
 ┣ 📜citizens
 ┣ 📜httpError      //Error handling model , not a schema 
 ┣ 📜cases            
 📂routes         // root of managing different API Endpoints in REST 
 ┣ 📜admin-routes.js
 ┗ 📜public-routes.js
```

## API DOCUMENTATION
### Get registered citizens 
```
GET   https://courtroom-admin.onrender.com/ccms/public
```
RESPONSE: All Citizens or Plaintiffs Array of objects with name, email, image and list of registered cases for each. 

### Get all registered cases by single citizen 
```
GET      https://courtroom-admin.onrender.com/ccms/public/single/:id
```
Path Variable: id : registered id of person\
EXAMPLE REQUEST:\
 id:    648dc77b1a7197fd8ac31388 \
EXAMPLE RESPONSE:
```
{
  "foundUser": {
    "_id": "648db598c8dfa0ec049c6ca8",
    "name": "Aakash",
    "email": "imsky@32gmail.com",
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRj4jCtU_gyHF8E34n_3ihpEtv9Cy0Ef6wQvA&usqp=CAU",
    "cases": [
      "6505f5a9d3742a3db0a17b4f"
    ],
    "__v": 9,
    "id": "648db598c8dfa0ec049c6ca8"
  }
}
```
### Signup, Create New User Account 
```
POST    https://courtroom-admin.onrender.com/ccms/public/signup
```
Request Body:\
{\
    email: REQUIRED, UNIQUE email of new user,\
    password: REQUIRED, minimum 6 digit password,\
    name: REQUIRED, name of new user,\
    idCardNo: UNIQUE Aadhar Card No. 12 Digit of new user\
}\
EXAMPLE REQUEST
```
BODY
{
  "email" : "iamsky43@gmail.com",
  "password": "samplePass",
  "name": "Akhil Kumar",
  "idCardNo": "798798979879"
}
```
EXAMPLE RESPONSE
```
{
  "added": {
    "name": "Akhil Kumar",
    "id": "655b8c1a65a93ea55c03b843"
  }
}
```

## Author
- [Aakash Mishra](https://portfolio-aakash28.netlify.app/)
- [My Github ](https://github.com/Aakash-mishra2)