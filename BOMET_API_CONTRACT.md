# Bomet DIGIT API Contract (verified live 2026-07-01)

Served from the Bomet server itself → **all paths are same-origin** (nginx catch-all `location / → Kong :18000`).
So the frontend `BASE_URL` = `""` (relative) when deployed at `https://bometfeedbackhub.digit.org/...`.

## Tenancy
- State/root tenant: `ke`  (used for auth, otp, localization)
- City tenant: `ke.bomet`  (used for PGR, MDMS, boundary)
- Mobile format: 9 digits `^[17][0-9]{8}$`, prefix `+254`
- Fixed mock OTP: `123456` (Kong request-termination returns 200 for `/user-otp` + `/otp`)
- Map center: `{ lat: -0.7817, lng: 35.3428 }`

## Auth (citizen, OTP)
1. **Send OTP** — `POST /user-otp/v1/_send?tenantId=ke`
   `{ "otp": { "mobileNumber":"7XXXXXXXX", "tenantId":"ke", "type":"login"|"register", "userType":"CITIZEN" } }` → 200
2. **Register** (auto, if not existing) — `POST /user/citizen/_create?tenantId=ke`
   `{ RequestInfo:{apiId,ver,action,did,key,msgId,authToken:null,userInfo:{id,uuid,type,tenantId}}, User:{ name, username:<mobile>, mobileNumber:<mobile>, type:"CITIZEN", tenantId:"ke", otpReference:"123456", roles:[{code:"CITIZEN",name:"Citizen",tenantId:"ke"}] } }`
   NOTE: **RequestInfo is REQUIRED** — without it the controller NPEs at `loggedInUserId()`.
3. **Authenticate** — `POST /user/oauth/token`
   Header `Authorization: Basic ZWdvdi11c2VyLWNsaWVudDo=` (= `egov-user-client:`)
   Body (x-www-form-urlencoded): `username=<mobile>&password=123456&tenantId=ke&userType=CITIZEN&scope=read&grant_type=password`
   → `{ access_token, refresh_token, UserRequest:{ id, uuid, userName, name, mobileNumber, type, tenantId, roles[] } }`

Standard citizen-login flow (from digit-ui): try authenticate → on failure registerUser → retry authenticate.

## RequestInfo (attach to every DIGIT call)
```
{ apiId:"Rainmaker", ver:"1.0", ts:0, action:"", did:"1", key:"", msgId:"<epoch>|en_IN", authToken:<token>, userInfo:<UserRequest> }
```

## PGR
- **Create** — `POST /pgr-services/v2/request/_create`
  `{ RequestInfo, service:{ tenantId:"ke.bomet", serviceCode, description, source:"web", address:{ tenantId:"ke.bomet", city:"Bomet", locality:{code:<wardCode>, name:<wardName>}, geoLocation:{latitude,longitude} } }, workflow:{ action:"APPLY" } }`
  → `{ ServiceWrappers:[{ service:{ serviceRequestId:"PG-PGR-YYYY-MM-DD-NNNNNN", applicationStatus:"PENDINGFORASSIGNMENT", ... }, workflow }] }`
  - `address.geoLocation` MUST be an object (persister crashes on null).
  - `additionalDetail` auto-enriched by server with `{department, serviceName}`.
- **Search** — `POST /pgr-services/v2/request/_search?tenantId=ke.bomet&mobileNumber=<mobile>`
  (also filters: `serviceRequestId`, `serviceCode`, `applicationStatus`, offset/limit)
  body `{ RequestInfo }` → `{ ServiceWrappers:[{ service, workflow }] }`
  `service` keys: active, citizen{id,uuid,name,mobileNumber,...}, id, tenantId, serviceCode, serviceRequestId, description, accountId, rating, additionalDetail{department,serviceName}, applicationStatus, source, address{locality{code},geoLocation{latitude,longitude}}, documents, auditDetails{createdTime,...}, processInstance
- **Update** (comment/rate/reopen) — `POST /pgr-services/v2/request/_update`
  send the FULL `service` object from search + `workflow:{action, comments, assignes?}`.
  Citizen actions by state: RESOLVED/REJECTED → `RATE`, `REOPEN`, `COMMENT`; any → `COMMENT`.

## PGR workflow (business service PGR)
`null →APPLY→ PENDINGFORASSIGNMENT →ASSIGN/REJECT/ESCALATE→ PENDINGATLME →RESOLVE→ RESOLVED →RATE/REOPEN/COMMENT`
Citizen-relevant actions: APPLY, COMMENT, RATE, REOPEN.
Statuses: PENDINGFORASSIGNMENT, PENDINGFORREASSIGNMENT, PENDINGATLME, PENDINGATSUPERVISOR, RESOLVED, RESOLVEDBYSUPERVISOR, REJECTED, CLOSEDAFTERRESOLUTION, CLOSEDAFTERREJECTION, CANCELLED.

## Categories (MDMS ServiceDefs) — 47 items, health sector
- `POST /mdms-v2/v2/_search`
  `{ RequestInfo, MdmsCriteria:{ tenantId:"ke.bomet", schemaCode:"RAINMAKER-PGR.ServiceDefs", limit:500 } }`
  → `{ mdms:[{ data:{ serviceCode, name, menuPath, department, slaHours, keywords, active } }] }`
- `menuPath` groups codes (e.g. "Service Scheduling Complaints", "Staff Attitude", "Medical Negligence / Malpractice", "Illegal Charges / Corruption", "Human Resource Disciplinary Cases", "Policy & Systemic Service Failures").
- Department master: `common-masters.Department` → only `DEPT_36` = HealthServices.

## Boundaries (wards) — hierarchy ADMIN: County → SubCounty → Ward, 35 wards
- Hierarchy: `POST /boundary-service/boundary-hierarchy-definition/_search` `{RequestInfo, BoundaryTypeHierarchySearchCriteria:{tenantId:"ke.bomet", hierarchyType:"ADMIN"}}`
- Entities: `POST /boundary-service/boundary/_search?tenantId=ke.bomet&hierarchyType=ADMIN&boundaryType=Ward` `{RequestInfo}` → `{ boundary:[{code}] }`
  Ward codes e.g. `BOMET_BOMET_CENTRAL`, `BOMET_CHEPALUNGU_KONGASIS`, `BOMET_SOTIK_KAPLETUNDO`, `BOMET_KONOIN_MOGOGOSIEK`.
- Full tree with relationships: `boundary-service/boundary-relationships/_search?tenantId=ke.bomet&hierarchyType=ADMIN&boundaryType=Ward&includeParents=true`

## Localization (display names for codes)
- `POST /localization/messages/v1/_search?tenantId=ke&locale=en_IN&module=rainmaker-pgr` (3055 msgs)
  category label: `SERVICEDEFS.<UPPERCODE>` / `COMPLAINT_HIERARCHY.<Code>`
- Ward names: module `rainmaker-common`, code pattern for boundary labels.
- Locales available: `en_IN` (default), plus fr/pt/etc per deploy.

## Filestore (photo upload)
- `POST /filestore/v1/files?tenantId=ke.bomet&module=pgr` multipart `file=@...` → `{ files:[{fileStoreId}] }`
- Fetch URLs: `GET /filestore/v1/files/url?tenantId=ke.bomet&fileStoreIds=<id>`
