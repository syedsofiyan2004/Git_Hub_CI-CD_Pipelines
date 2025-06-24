# Kubernetes Class Assignment

## Deploy and Manage NGINX with a Deployment

### Step 1: Create the Deployment YAML File

I created a file named **sofiyan-deployment.yaml**:

```yaml
apiVersion: apps/v1     
kind: Deployment        
metadata:
  name: sofiyan-nginx-deployment
spec:
  replicas: 4          
  selector:
    matchLabels:
      app: nginx      
  template:             
    metadata:
      labels:
        app: nginx   
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80
```
## Step 2: Apply the Deployment and Verify It

To apply the deployment, I ran:
```bash
kubectl apply -f sofiyan-deployment.yaml
```
![Screenshot 2025-06-21 154344](https://github.com/user-attachments/assets/4487c816-c074-45f8-927a-34a9189aa2a1)

Then I checked the results using:
```bash
kubectl get deployments
```
![Screenshot 2025-06-21 154430](https://github.com/user-attachments/assets/e7f29bd9-4d02-4360-87a3-2aa37479c18c)
```bash
kubectl get replicasets
```
![Screenshot 2025-06-21 154500](https://github.com/user-attachments/assets/56d20dfa-1ebb-43d6-8cc5-4c24bd791617)
```bash
kubectl get pods
```
![Screenshot 2025-06-21 154538](https://github.com/user-attachments/assets/9ea2af45-dfa9-4058-8655-8ba0da1a278b)

I saw:

-One Deployment named nginx-deployment

-One ReplicaSet managing it

-Two running NGINX Pods

It worked exactly as expected.

## Step 3: Test Auto-Healing

Now, I tried deleting one of the Pods to test auto-healing:
```bash
kubectl delete pod kubectl delete pod sofiyan-nginx-deployment-647677fc66-vc9kk
```
Then quickly checked again:
```bash
kubectl get pods
```
![Screenshot 2025-06-21 154744](https://github.com/user-attachments/assets/55d28ba9-9f08-4fc7-bd51-111ec8e65bda)
A new Pod spun up immediately to replace the one I deleted  confirming that auto-healing is working perfectly.

This is the magic of Deployments and ReplicaSets together.

## Step 4: Scale the Deployment
To simulate real-world traffic growth, I scaled the number of Pods from 2 to 4:
![Screenshot 2025-06-21 154809](https://github.com/user-attachments/assets/8e1605d0-f172-4423-bed1-1aaab3d21ebb)

Edited the YAML file:

replicas: 4

![Screenshot 2025-06-21 154826](https://github.com/user-attachments/assets/154b65df-86d9-491d-b50b-327dd1ebb126)

Re-applied the deployment:
```bash
kubectl apply -f sofiyan-deployment.yaml
```
![Screenshot 2025-06-21 155143](https://github.com/user-attachments/assets/4bf17278-e9aa-4dfb-b3f9-d9ab296c09c9)

Verified the new state:
```bash
kubectl get pods
```
![Screenshot 2025-06-21 155209](https://github.com/user-attachments/assets/885c7cbe-0c12-4677-ba58-22973a735513)

Four NGINX Pods were now running  automatically created by the ReplicaSet. Scaling complete

Then i deleted a pod a then checked the pods again and observed that the pod is created automatically.
![Screenshot 2025-06-21 155307](https://github.com/user-attachments/assets/96071672-8132-480e-a52e-aaf8a11277c8)



## Final Thoughts

 -Kubernetes Deployments are essential for any production environment.

 -They add resilience, scalability, and maintainability to your apps.

 -This lab taught me how to define, deploy, scale, and recover apps the Kubernetes-native way.


## This is the Final Deliverable of this assignment 


# END OF ASSIGNMENT
