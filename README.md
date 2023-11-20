# CCMS-Backend Node Backend
This project is backend of My personal Full-Stack project Court Case Management. This project uses Node-Express framework for developing a REST API. Proper use of router, express-validators for inputs and error handling. Feel free to update and contribute.

[CCMS Front End Repository](https://github.com/Aakash-mishra2/reactjs-courtcase-management-web-app)

[Deployed Project](https://yourccms.netlify.app/)


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

### Get all registered cases by a single citizen (or currently Logged In User)
```
GET      https://courtroom-admin.onrender.com/ccms/public/single/:id
```
>**Path Variable:** id : *registered id of person*\
>>**EXAMPLE REQUEST:**\
 id:    648dc77b1a7197fd8ac31388 \
>>**EXAMPLE RESPONSE:**
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
>**Request Body:**\
{\
    email: *REQUIRED, UNIQUE email of new user*,\
    password: *REQUIRED, minimum 6 digit password*,\
    name: *REQUIRED, name of new user*,\
    idCardNo: *UNIQUE Aadhar Card No. 12 Digit of new user*\
}\
>>**EXAMPLE REQUEST**
```
BODY
{
  "email" : "iamsky43@gmail.com",
  "password": "samplePass",
  "name": "Akhil Kumar",
  "idCardNo": "798798979879"
}
```
>>**EXAMPLE RESPONSE**
```
{
  "added": {
    "name": "Akhil Kumar",
    "id": "655b8c1a65a93ea55c03b843"
  }
}
```
### Login User 
```
POST    https://courtroom-admin.onrender.com/ccms/public/login
```
>**Request Body:**\
{\
    email: *REQUIRED, UNIQUE email of new user*,\
    password: *REQUIRED, minimum 6 digit password*,\
}\
>>**EXAMPLE REQUEST**
```
BODY
{
  "email" : "iamsky43@gmail.com",
  "password": "samplePass",
}
```
>>**EXAMPLE RESPONSE**
```
{
  "message": "Logged In!. ",
  "citizen": {
    "_id": "655b8c1a65a93ea55c03b843",
    "name": "Akhil Kumar",
    "email": "iamsky43@gmail.com",
    "password": "0",
    "image": "https://static.vecteezy.com/system/resources/previews/022/159/714/original/icon-concept-of-avatar-user-account-for-social-media-with-circle-line-can-be-used-for-technology-business-and-platforms-can-be-applied-to-web-website-poster-mobile-apps-ads-free-vector.jpg",
    "idCardNo": 0,
    "cases": [],
    "__v": 0,
    "id": "655b8c1a65a93ea55c03b843"
  }
}
```
### ADD/Update ID CARD No. and Case Description 
```
PATCH    https://courtroom-admin.onrender.com/ccms/public/update/:cid
```
>**Path Variable**  cid : *Registered Case ID*\

>**Request Body:**\
{\
    cardNo: *UNIQUE Aadhar Card No. 12 Digit of new user*,\
    description: *Text description of court case issue in summary*,\
}\
>>**EXAMPLE REQUEST**
```
cid: 650a9cdedf9bb7700d91d3f1
BODY
{
 "cardNo" : "678945672348",
 "description" : "Stolen vehicle case of RED Maruti Car from dariyaganj on 21 November 2023"
}
```
>>**EXAMPLE RESPONSE**
```
{
  "message": "Your case 650a9cdedf9bb7700d91d3f1 is updated. "
}
```
### Get Case by ID
```
GET    https://courtroom-admin.onrender.com/ccms/admin/:cid
```
>**Path Variable**  cid : *Registered Case ID*\

>>**EXAMPLE REQUEST**
```
https://courtroom-admin.onrender.com/ccms/admin/650a9cdedf9bb7700d91d3f1
```
>>**EXAMPLE RESPONSE**
```
{
  "foundCase": {
    "location": {
      "city": "Delhi",
      "pincode": 11232424
    },
    "_id": "650a9cdedf9bb7700d91d3f1",
    "court": "Rohini Court Delhi",
    "description": "Stolen vehicle case of RED Maruti Car from dariyaganj on 21 November 2023",
    "image": "https://d2r2ijn7njrktv.cloudfront.net/IL/uploads/2021/12/09125921/rohini-district-court.jpg",
    "judge": "Mr. Sharad kumar singh",
    "status": "Accepted",
    "next_hearing": " 13-08-2023",
    "plaintiff": "648db724c8dfa0ec049c6cbd",
    "__v": 0,
    "id": "650a9cdedf9bb7700d91d3f1"
  }
}
```
### Get All Registered Cases of a User (or auto fetch currently logged in User's Cases)
```
GET    https://courtroom-admin.onrender.com/ccms/admin/user/:uID
```
>**Path Variable**  uID : *Registered User ID*\

>>**EXAMPLE REQUEST**
```
https://courtroom-admin.onrender.com/ccms/admin/user/648db724c8dfa0ec049c6cbd
```
>>**EXAMPLE RESPONSE**
```
{
  "allCases": [
    {
      "location": {
        "city": "Delhi",
        "pincode": 11232424
      },
      "_id": "650a9cdedf9bb7700d91d3f1",
      "court": "Rohini Court Delhi",
      "description": "Stolen vehicle case of RED Maruti Car from dariyaganj on 21 November 2023",
      "image": "https://d2r2ijn7njrktv.cloudfront.net/IL/uploads/2021/12/09125921/rohini-district-court.jpg",
      "judge": "Mr. Sharad kumar singh",
      "status": "Accepted",
      "next_hearing": " 13-08-2023",
      "plaintiff": "648db724c8dfa0ec049c6cbd",
      "__v": 0,
      "id": "650a9cdedf9bb7700d91d3f1"
    },
    {
      "location": {
        "city": "Delhi",
        "pincode": 11232424
      },
      "_id": "650a9d2ddf9bb7700d91d3f6",
      "court": " Allahabad High Court",
      "description": " Vehicle stolen case",
      "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRholMhydH0A3KqdWelqNqBG_YgCPQaOXa2vS2SufTU5w&usqp=CAU&ec=48600113",
      "judge": "Mrs. Surbhi tiwari",
      "status": "Accepted",
      "next_hearing": " 28-11-2023 ",
      "plaintiff": "648db724c8dfa0ec049c6cbd",
      "__v": 0,
      "id": "650a9d2ddf9bb7700d91d3f6"
    }
  ]
}
```
### Register a New Court Case Application
```
POST    https://courtroom-admin.onrender.com/ccms/admin/newcase
```
>**Path Variable**  cid : *Registered Case ID*\
>**Request Body**
{\
    court: *Name of the court*,\
    description: *REQUIRED, Short Description of issue of case*,\
    location_city: *City of Court*,\
    location_pincode: *Zip Code of Court Address*,\
    judge: *Judge Assigned to handle the case proceedings*,\
    plaintiff: *REQUIRED, UserID of applicant citizen account*\
}\

>>**EXAMPLE REQUEST**
```
{
 "court" : "The City Civil Court",
 "description" : "Road Accident case of Hit and Run by Suspect on 21 November",
 "location_city": "Bangaluru",
 "location_pincode": "560009",
 "judge": "Mr. Satyam Sharma",
 "plaintiff": "64f9b4ab2dcf215b483b6268"
}
```
>>**EXAMPLE RESPONSE**
```
{
  "added_NewCase": {
    "court": "The City Civil Court",
    "description": "Road Accident case of Hit and Run by Suspect on 21 November",
    "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRholMhydH0A3KqdWelqNqBG_YgCPQaOXa2vS2SufTU5w&usqp=CAU&ec=48600113",
    "location": {
      "city": "Bangaluru",
      "pincode": 560009
    },
    "judge": "Mr. Satyam Sharma",
    "status": "NOT ACCEPTED",
    "next_hearing": " TO BE DECIDED ",
    "plaintiff": "64f9b4ab2dcf215b483b6268",
    "_id": "655bb99e1b572027ecef9684",
    "__v": 0
  }
}
```
### Update Case Application Status (Accepted/Rejected) and Next Hearing Dates
```
PATCH   https://courtroom-admin.onrender.com/ccms/admin/update/:cid
```
>**Path Variable**  cid : *ID of case to be updated*\

>>**EXAMPLE REQUEST**
```
https://courtroom-admin.onrender.com/ccms/admin/update/655bb99e1b572027ecef9684
{
 "new_status": "ACCEPTED",
 "next_hearing": "21/11/2023"
}
```
>>**EXAMPLE RESPONSE**
```
{
  "message": " Your case 655bb99e1b572027ecef9684 is updated. "
}
```
### Delete Existing Case or Withdraw Case
```
DELETE    https://courtroom-admin.onrender.com/ccms/admin/remove/:did
```
>**Path Variable**  did : *ID for case to be deleted*\

>>**EXAMPLE REQUEST**
```
https://courtroom-admin.onrender.com/ccms/admin/remove/655bb99e1b572027ecef9684
```
>>**EXAMPLE RESPONSE**
```
{
  "message": "Deleted Case"
}
```

## Author
- [Aakash Mishra](https://portfolio-aakash28.netlify.app/)
- [My Github ](https://github.com/Aakash-mishra2)