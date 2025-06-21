# Git-Hub Worflow Take Home Assignment

In this assignment we are making a pipeline to automate the running and installation of Docker inside our EC2 instance, and also the Creating and building image and running the container automatically in the EC2 Instance for that we need to write a CI-CD pipeline in GitHub Actions

Initially i have created a Repository in Docker Hub in which the image will be uploaded by the Git Workflow CI-CD Pipeline:

![Screenshot 2025-06-21 175117](https://github.com/user-attachments/assets/ec4e93d5-666e-4d2b-8dc1-b5d20ec10ba0)
![Screenshot 2025-06-21 175144](https://github.com/user-attachments/assets/b8fdac6e-61df-4199-9e15-76c616ea7671)

Then after i have created an Access Token for Git-Hub Actions in Docker Hub with Read & Write Permissions:

![Screenshot 2025-06-21 175659](https://github.com/user-attachments/assets/986a0670-bf37-45f6-9308-773683925f4e)
![Screenshot 2025-06-21 175820](https://github.com/user-attachments/assets/7d691622-f3d4-4fdb-8302-5953ec7245c9)

After this creation of Access Tokens i have created a Github Repository named **Git_Hub_CI-CD_Pipelines** and then proceeded to the Actions Tab and there i have written a ci-cd pipeline code with the file name as **ci-cd_pipelines.yaml**:

![image](https://github.com/user-attachments/assets/6471dd54-1076-4daf-a2b8-cff7059706af)

The code was as follows:
```yaml
name: Sofiyan CI/CD Pipeline

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  IMAGE_NAME: ${{ secrets.DOCKERHUB_USERNAME }}/sofiyan_github_ci-cd_pipelines

jobs:
  build:
    name: Build and Push Docker Image
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Log in to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ env.IMAGE_NAME }}:${{ github.sha }}
          build-args: |
            APP_VERSION=${{ github.sha }}

  deploy:
    name: Deploy to EC2
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH to EC2
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USERNAME }}
          key: ${{ secrets.EC2_SSH_KEY }}
          port: 22
          script: |
            echo "${{ secrets.DOCKERHUB_TOKEN }}" | sudo docker login -u ${{ secrets.DOCKERHUB_USERNAME }} --password-stdin
            sudo docker pull ${{ env.IMAGE_NAME }}:${{ github.sha }}
            sudo docker stop my-app-container || true
            sudo docker rm my-app-container || true
            sudo docker run -d --name my-app-container --restart always -p 3000:3000 ${{ env.IMAGE_NAME }}:${{ github.sha }}
            sudo docker image prune -a -f
```
In this code i have used a docker Hub repository instead of github cause the git hub registories are cost incurring and i found Docker Hub Repository for free thats why proceeded to make it in that way

Then after i have created the terraform files for creating an Ec2 instances:
The **main.tf** goes as follow:
```tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"  
    }
  }
}

provider "aws" {
  region = var.aws_region
}

resource "aws_vpc" "main_vpc" {
  cidr_block = var.vpc_cidr

  tags = {
    Name = "syed_sofiyan-vpc"
  }
}

resource "aws_subnet" "public_subnet" {
  vpc_id            = aws_vpc.main_vpc.id
  cidr_block        = var.subnet_cidr
  availability_zone = "${var.aws_region}a"

  tags = {
    Name = "syed_sofiyan-subnet"
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main_vpc.id

  tags = {
    Name = "syed_sofiyan-igw"
  }
}

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.main_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "syed_sofiyan-rt"
  }
}

resource "aws_route_table_association" "public_rt_assoc" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_security_group" "web_sg" {
  name        = "syed_sofiyan-sg"
  description = "Allow SSH and app port 3000 access"
  vpc_id      = aws_vpc.main_vpc.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] 
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] 
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "syed_sofiyan-sg"
  }
}

resource "aws_instance" "web_server" {
  ami                         = var.ami_id
  instance_type               = var.instance_type
  subnet_id                   = aws_subnet.public_subnet.id
  vpc_security_group_ids      = [aws_security_group.web_sg.id]
  associate_public_ip_address = true
  key_name                   = var.key_pair_name

  user_data = <<-EOF
    #!/bin/bash
    yum update -y
    amazon-linux-extras install docker -y
    systemctl start docker
    systemctl enable docker
    usermod -aG docker ec2-user
  EOF

  tags = {
    Name = "syed_sofiyan-ec2"
  }
}
```
Here I have Configured Security Groups to allow port 22 and 3000 inbound traffic.
And the EC2 instance also configured with t2.micro instance type

The **variables.tf** is as follows:
```tf
variable "aws_region" {
  description = "Region where resources will be deployed"
  type        = string
  default     = "ap-south-1"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "subnet_cidr" {
  description = "CIDR block for subnet"
  type        = string
  default     = "10.0.0.0/24"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "key_pair_name" {
  description = "Name of EC2 key pair for SSH access"
  type        = string
  default     = "syed_sofiyan-kp"
}

variable "ami_id" {
  description = "AMI ID for Amazon Linux 2"
  type        = string
  default     = "ami-0b09627181c8d5778"  
}
```
Here i have defined the variables and also mentioned the CIDR blocks for VPC's and Subnets

The **output.tf** is as follow:
```tf
output "public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.web_server.public_ip
}

output "public_dns" {
  description = "Public DNS name of the EC2 instance"
  value       = aws_instance.web_server.public_dns
}
```
This will give you Public IP of your instance as output

Now before creating any resources we need to create our Application in node js so first run the following commands:
```sh
npm init
```
![image](https://github.com/user-attachments/assets/9013314b-208a-423b-ad3c-f36e91238bef)
![image](https://github.com/user-attachments/assets/f277dd9f-bf52-4e57-9849-bdc025ef6b8f)
```sh
npm i express
```
![image](https://github.com/user-attachments/assets/1706252e-8cf9-41f4-b22c-e787ba0b2414)

This will give you two files named **package.json** and **package-lock.json** we need these files to proceed further

Then we have to create an **app.js** file for our app:
```js
const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  const version = process.env.APP_VERSION || "1.0.0";
  res.send(`Hello from our container! Version: ${version}. Deployed automatically!`);
});

app.listen(PORT, () => {
  console.log(`Server running on <http://localhost>:${PORT}`);
});
```
This will be Displayed in our EC2 instance later

Now we have to write our **Dockerfile** for our application which is very Important as we are running our application on Docker in our EC2 Instance:
```DockerfileFROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD [ "npm", "start" ]
```
This is a simple Dockerfile to run your application in Docker Container

Now we have to create the instances lets run the Terraform commands:
```sh
terraform init
```
![image](https://github.com/user-attachments/assets/28d8acb0-617e-4eb6-9f91-4674aa4e7763)
```bash
terraform plan
```
![image](https://github.com/user-attachments/assets/382b7400-afb8-4835-be64-59d5869fd766)
![image](https://github.com/user-attachments/assets/375ee6e1-552e-4a88-bb1c-73fb6d24a3ba)
```bash
terraform apply
```
![image](https://github.com/user-attachments/assets/0b81132a-9256-4316-8b0b-6109007234de)
![image](https://github.com/user-attachments/assets/94273c43-0b26-48b5-b27e-b283b97766f6)

As we can see we got our public IP as **13.235.244.54** this is our public IP of our EC2 Instance
![Screenshot 2025-06-21 190344](https://github.com/user-attachments/assets/df7596a2-5b5d-417e-a8c2-7e169b17eaa9)

And also the VPC's Subnets are also created:

![Screenshot 2025-06-21 190307](https://github.com/user-attachments/assets/ac58af32-2cfb-4d3a-b3d8-012989ec9976)

This is how our Security group looks like:

![Screenshot 2025-06-21 190428](https://github.com/user-attachments/assets/cb0b069d-7d91-4929-8650-ef94dad0668c)

Now we have to SSH into our EC2 Instance to Download Docker to run our Docker Image via Pipeline:

we have to type the following command to ssh into our EC2 Instance:
```bash
ssh -i sofiyan-kp.pem ec2-user@13.235.244.54
```
![image](https://github.com/user-attachments/assets/3de7e764-caba-40c4-b59b-ad0f81a9f885)

As we can see there is no docker in our Instance we need to download it via following commands:
```bash
#As we our Using Amazon Linux Image we need to run this command
sudo dnf update -y
# This will install Docker package in your instance
sudo dnf install -y docker
# After installing start and enable Docker service
sudo systemctl start docker
sudo systemctl enable docker
# Sometimes sudo doesnt work so add ec2-user to docker group so you can run docker without sudo
sudo usermod -aG docker ec2-user
 ```
![image](https://github.com/user-attachments/assets/06dd230d-934a-498e-96bc-abe7e07e6cda)
![image](https://github.com/user-attachments/assets/95ce7f7d-0a50-42fe-b3ff-b157b3b9e27f)

After this add Following Secrets in Your Git-Hub Repository:

**DOCKERHUB_USERNAME** — your Docker Hub username.

**DOCKERHUB_TOKEN** — Docker Hub access token.

**EC2_HOST** — Public IP of your EC2 instance.

**EC2_USERNAME** — Usually ec2-user.

**EC2_SSH_KEY** — Contents of your .pem private key file.

![image](https://github.com/user-attachments/assets/5c0caa29-18a0-42a9-baf9-6d9ddff746db)
![Screenshot 2025-06-21 192941](https://github.com/user-attachments/assets/e91b4752-600d-4cf2-bab5-5cd892885392)

Now we can successfully Run the Pipeline just commit the pipeline code and you will see the magic:

![image](https://github.com/user-attachments/assets/e12b79c2-b6ca-449a-89af-13c5e7aaa9d5)

Also check whether the image is created and uploaded in Docker Hub the repository or not:

![Screenshot 2025-06-21 203740](https://github.com/user-attachments/assets/6292efc1-4ae9-4246-b478-1ffb56ed3872)
![image](https://github.com/user-attachments/assets/9a9c4f40-f7a8-4a8d-a8b0-8d54ab100561)

image was created and the app was exposed to **port 3000**

As we can see our build is Success now check whether the Application is running or not on the **port 3000:**
```bash
http://13.235.244.54:3000
```
![Screenshot 2025-06-21 203345](https://github.com/user-attachments/assets/9585cead-db08-4916-9b91-0e47f885780b)

now lets check whether our container is running in our EC2 Instance or not:
![image](https://github.com/user-attachments/assets/e109084b-a7db-488d-9ac8-cde6ee0d16db)

As we can see the pipeline code has created the container with **named my-app-container** on port 3000

This shows that our Assignment was success by Automationg our application running on docker container in our EC2 Machine

## This is the Final Deliverable of our Assignment 

# END OF ASSIGNMENT





















