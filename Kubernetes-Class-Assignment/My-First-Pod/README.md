#  Deploying My First Kubernetes Pod (NGINX Lab)

Hey there!   
This is a quick lab assignment where I deployed my **first application pod** using Kubernetes. The goal was to get hands-on experience with YAML manifests, deploying pods, and doing some basic troubleshooting.


##  What I Deployed

A simple **NGINX web server** using a Pod.  
Why i used NGINX is because it’s lightweight, popular, and perfect for a first time testing of my deployment in Kubernetes.

##  Step-by-Step Breakdown

###  Step 1: Created the Pod YAML

I created a file called **sofiyan-pod.yaml** with the following configuration:

```yaml
apiVersion: v1         
kind: Pod              
metadata:
  name: nginx-pod     
  labels:
    app: nginx         
spec:                  
  containers:         
  - name: nginx-container 
    image: nginx:1.14.2   
    ports:
    - containerPort: 80 
```
This YAML tells Kubernetes:

 -I'm deploying a Pod
 
 -It will be named nginx-pod
 
 -It runs a container using the nginx:1.14.2 image
 
 -That container listens on port 80

## Step 2: Deployed the Pod

-I used this command to apply the YAML and create the pod:
```sh
kubectl apply -f sofiyan-pod.yaml
```
![Screenshot 2025-06-21 153249](https://github.com/user-attachments/assets/fd762cdc-4423-455d-bb0f-65f26f25f3c1)
And got this confirmation:

pod/nginx-pod created

As we can see in the image the pod is successfully deployed

###  Step 3: Inspecting and Debugging the Pod

Once the pod was deployed, it was time to check if everything was working as expected.

#### Check if the Pod is Running

I ran:

```bash
kubectl get pods
```
![Screenshot 2025-06-21 153321](https://github.com/user-attachments/assets/5efea4c7-934f-4111-adcf-0e249b69cd33)

And to see extra details like the node name and IP:
```bash
kubectl get pods -o wide
```
![Screenshot 2025-06-21 153350](https://github.com/user-attachments/assets/8d199062-a265-4561-a906-8e469f6b21ca)

Let's View Logs from the Container

-To see what NGINX was doing inside the pod:

I Have run this command:
```bash
kubectl logs nginx-pod
```

Describe the Pod (for Deep Debugging)

One of the most useful commands in Kubernetes:
```bash
kubectl describe pod nginx-pod
```
It showed me:

-Events like image pull status

-When the container started

-Any errors

-Networking info and resource usage
![Screenshot 2025-06-21 153515](https://github.com/user-attachments/assets/5b62bab3-ab35-4a8b-9923-35168d8ff78f)
![Screenshot 2025-06-21 153550](https://github.com/user-attachments/assets/bcdd1c17-5500-425b-b38f-bc19a7fd0fdb)

## This is the Final Deliverable of this Assignment


# END OF ASSIGNMENT

