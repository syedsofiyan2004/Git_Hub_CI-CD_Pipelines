# Kubernetes Take Home Assignment

### Step 1: Create Kubernetes Secret

First, we need to store sensitive credentials username & password securely.

#### Encode credentials (base64):

```bash
echo -n 'Syed_Sofiyan' | base64

echo -n 'Thisissecret' | base64
```
![image](https://github.com/user-attachments/assets/cf0816f7-1a7f-4d66-945a-d7142170ad17)

Then i have created a file named **sofiyan-mongo-secret.yaml** and then have written the following code:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: sofiyan-mongodb-secret
type: Opaque
data:
  mongo-root-username: U3llZF9Tb2ZpeWFu
  mongo-root-password: VGhpc2lzc2VjcmV0
```
Then applied the secrets:
```bash
kubectl apply -f sofiyan-mongo-secret.yaml
kubectl get secret
```
![Screenshot 2025-06-18 151957](https://github.com/user-attachments/assets/d9b2a725-f605-4069-99dc-484fd6027e99)

 ## Step 2: Deploy MongoDB with Deployment + ClusterIP Service:
 
Then i have created a file named **sofiyan-mongo-deployment.yaml** and then have written the following code:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sofiyan-mongodb-deployment
  labels:
    app: mongodb
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
      - name: mongodb
        image: mongo
        ports:
        - containerPort: 27017
        env:
        - name: MONGO_INITDB_ROOT_USERNAME
          valueFrom:
            secretKeyRef:
              name: sofiyan-mongodb-secret
              key: mongo-root-username
        - name: MONGO_INITDB_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: sofiyan-mongodb-secret
              key: mongo-root-password
---
apiVersion: v1
kind: Service
metadata:
  name: sofiyan-mongodb-service
spec:
  selector:
    app: mongodb
  ports:
    - protocol: TCP
      port: 27017
      targetPort: 27017
```
Then applied the deployment:
```bash
kubectl apply -f sofiyan-mongo-deployment.yaml
kubectl get all
```
![Screenshot 2025-06-18 152351](https://github.com/user-attachments/assets/ac980f5c-fe8d-4ce8-a5f7-515b110d5ba5)

After applying and verifying i saw the following:

-1 Pod running MongoDB

-1 Deployment

-1 ReplicaSet

-1 Service (ClusterIP)

## Step 3: Create ConfigMap

We use a ConfigMap to store the MongoDB service name.

I have created a file named **sofiyan-configmap.yaml** and then have written the following code:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: sofiyan-mongodb-configmap
data:
  database_url: mongodb-service
```
And then applied it and checked the results by running the following commands:
```bash
kubectl apply -f sofiyan-mongo-configmap.yaml
kubectl get configmaps
```
![Screenshot 2025-06-18 152604](https://github.com/user-attachments/assets/b722c343-4ee3-4512-8bf5-75807ec1307a)

 ## Step 4: Deploy Mongo-Express and Expose Externally

 Then i have created a file named **sofiyan-mongo-express.yaml** and have written the following code:
 ```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sofiyan-mongo-express-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongo-express
  template:
    metadata:
      labels:
        app: mongo-express
    spec:
      containers:
        - name: mongo-express
          image: mongo-express
          ports:
            - containerPort: 8081
          env:
            - name: ME_CONFIG_MONGODB_SERVER
              value: sofiyn-mongodb-service
            - name: ME_CONFIG_MONGODB_ADMINUSERNAME
              valueFrom:
                secretKeyRef:
                  name: sofiyan-mongodb-secret
                  key: mongo-root-username
            - name: ME_CONFIG_MONGODB_ADMINPASSWORD
              valueFrom:
                secretKeyRef:
                  name: sofiyan-mongodb-secret
                  key: mongo-root-password
---
apiVersion: v1
kind: Service
metadata:
  name: sofiyan-mongo-express-service
spec:
  type: NodePort
  selector:
    app: mongo-express
  ports:
    - port: 8081
      targetPort: 8081
      nodePort: 30001
```
After writing this code i have applied it and then checked the results by running the following commands:
```bash
kubectl apply -f sofiyan-mongo-express.yaml
kubectl get all
```
![Screenshot 2025-06-18 152912](https://github.com/user-attachments/assets/08410d28-a852-48f8-b5e2-cce25e43ca64)

I have observed from the results that:

-Mongo-Express Pod

-Deployment and ReplicaSet

-LoadBalancer Service on port 30000

## Final Step:
Run the following command to access the app:
```bash
minikube service sofiyan-mongo-express-service
```
![Screenshot 2025-06-21 133542](https://github.com/user-attachments/assets/e5f78cd0-6a99-4469-ac9b-d5d48162236c)

Copy the URL and Go to the Browser

This will open the Mongo-Express web UI in your browser:
Log in with the credentials:
```text
Username:Syed_Sofiyan

Password:Thisissecret
```
![Screenshot 2025-06-21 132103](https://github.com/user-attachments/assets/d7a7a183-ebe4-4a17-9fb7-b440ab006b50)

After Entering the credentials you will be redirected to the Mongo-DB as you can see in the image:
![Screenshot 2025-06-21 132152](https://github.com/user-attachments/assets/0c0a0b81-df67-4b96-9276-d21ce74ea22e)

## This is the Final Deliverable for this Assignment

Let's Proceed with the Cleanup Job 

Type the following commands:
```bash
kubectl delete -f sofiyan-mongo-express.yaml
kubectl delete -f sofiyan-mongo-deployment.yaml
kubectl delete -f sofiyan-mongo-configmap.yaml
kubectl delete -f sofiyan-mongo-secret.yaml
```
![Screenshot 2025-06-21 170735](https://github.com/user-attachments/assets/b05a39d6-5067-4fee-8d20-8581b0e1f9a6)
![Screenshot 2025-06-21 170830](https://github.com/user-attachments/assets/5fb87461-971b-41a1-8420-0a0de1d5f08d)

# END OF ASSIGNMENT
