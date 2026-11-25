

pipeline {
    agent any

    environment {
        AWS_REGION = 'eu-north-1'
        AWS_ACCOUNT_ID = '887074880802'

        ECR_REGISTRY = '887074880802.dkr.ecr.eu-north-1.amazonaws.com'

        FRONTEND_REPO = 'supermarket-frontend'
        BACKEND_REPO = 'supermarket-backend'

        // Replace with your deployment EC2 public IP
        DEPLOY_HOST = '16.192.57.225'
        DEPLOY_USER = 'ubuntu'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo 'GitHub source code checked out successfully'
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh '''
                    docker build \
                      -f Dockerfile.frontend \
                      -t $ECR_REGISTRY/$FRONTEND_REPO:$BUILD_NUMBER .
                '''
            }
        }

        stage('Build Backend Image') {
            steps {
                sh '''
                    docker build \
                      -f backend/Dockerfile \
                      -t $ECR_REGISTRY/$BACKEND_REPO:$BUILD_NUMBER backend
                '''
            }
        }

        stage('Login to AWS ECR') {
            steps {
                sh '''
                    aws ecr get-login-password \
                      --region $AWS_REGION | \
                    docker login \
                      --username AWS \
                      --password-stdin $ECR_REGISTRY
                '''
            }
        }

        stage('Push Frontend Image') {
            steps {
                sh '''
                    docker push \
                      $ECR_REGISTRY/$FRONTEND_REPO:$BUILD_NUMBER
                '''
            }
        }

        stage('Push Backend Image') {
            steps {
                sh '''
                    docker push \
                      $ECR_REGISTRY/$BACKEND_REPO:$BUILD_NUMBER
                '''
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent(credentials: ['freshmart-deploy-key']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=accept-new \
                          $DEPLOY_USER@$DEPLOY_HOST \
                          "AWS_REGION='$AWS_REGION' \
                           ECR_REGISTRY='$ECR_REGISTRY' \
                           FRONTEND_IMAGE='$ECR_REGISTRY/$FRONTEND_REPO:$BUILD_NUMBER' \
                           BACKEND_IMAGE='$ECR_REGISTRY/$BACKEND_REPO:$BUILD_NUMBER' \
                           bash -s" <<'REMOTE'

                        set -e

                        if [ ! -f /opt/freshmart/backend.env ]; then
                            echo "Backend environment file missing!"
                            exit 1
                        fi

                        aws ecr get-login-password \
                          --region "$AWS_REGION" | \
                        sudo docker login \
                          --username AWS \
                          --password-stdin "$ECR_REGISTRY"

                        sudo docker network create freshmart-net \
                          2>/dev/null || true

                        sudo docker pull "$BACKEND_IMAGE"
                        sudo docker pull "$FRONTEND_IMAGE"

                        sudo docker rm -f freshmart-frontend \
                          2>/dev/null || true

                        sudo docker rm -f freshmart-backend \
                          2>/dev/null || true

                        sudo docker run -d \
                          --name freshmart-backend \
                          --restart unless-stopped \
                          --network freshmart-net \
                          --env-file /opt/freshmart/backend.env \
                          "$BACKEND_IMAGE"

                        sudo docker run -d \
                          --name freshmart-frontend \
                          --restart unless-stopped \
                          --network freshmart-net \
                          -p 80:80 \
                          "$FRONTEND_IMAGE"

                        sudo docker ps

                        REMOTE
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'FreshMart CI/CD deployment successful!'
        }

        failure {
            echo 'FreshMart pipeline failed. Check Jenkins Console Output.'
        }
    }
}
