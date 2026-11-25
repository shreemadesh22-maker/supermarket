
pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        AWS_REGION = 'eu-north-1'
        AWS_ACCOUNT_ID = '887074880802'

        ECR_REGISTRY = '887074880802.dkr.ecr.eu-north-1.amazonaws.com'

        FRONTEND_REPO = 'supermarket-frontend'
        BACKEND_REPO = 'supermarket-backend'

        FRONTEND_IMAGE = "${ECR_REGISTRY}/${FRONTEND_REPO}"
        BACKEND_IMAGE = "${ECR_REGISTRY}/${BACKEND_REPO}"

        DOCKER_NETWORK = 'freshmart-net'
        FRONTEND_CONTAINER = 'freshmart-frontend'
        BACKEND_CONTAINER = 'freshmart-backend'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm

                echo 'GitHub source code downloaded successfully!'
            }
        }

        stage('Verify Files') {
            steps {
                sh '''
                    set -e

                    echo "Checking project files..."

                    test -f Dockerfile.frontend
                    test -f nginx/default.conf
                    test -f backend/Dockerfile
                    test -f backend/package.json
                    test -f backend/server.js

                    echo "All required files are present!"
                '''
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh '''
                    docker build \
                        -f Dockerfile.frontend \
                        -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} \
                        .
                '''

                echo 'Frontend Docker image built successfully!'
            }
        }

        stage('Build Backend Image') {
            steps {
                sh '''
                    docker build \
                        -f backend/Dockerfile \
                        -t ${BACKEND_IMAGE}:${BUILD_NUMBER} \
                        backend
                '''

                echo 'Backend Docker image built successfully!'
            }
        }

        stage('Login to AWS ECR') {
            steps {
                sh '''
                    aws ecr get-login-password \
                        --region ${AWS_REGION} | \
                    docker login \
                        --username AWS \
                        --password-stdin ${ECR_REGISTRY}
                '''

                echo 'AWS ECR login successful!'
            }
        }

        stage('Push Frontend Image') {
            steps {
                sh '''
                    docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}
                '''

                echo 'Frontend image pushed to AWS ECR!'
            }
        }

        stage('Push Backend Image') {
            steps {
                sh '''
                    docker push ${BACKEND_IMAGE}:${BUILD_NUMBER}
                '''

                echo 'Backend image pushed to AWS ECR!'
            }
        }

        stage('Prepare Docker Network') {
            steps {
                sh '''
                    docker network inspect ${DOCKER_NETWORK} \
                        >/dev/null 2>&1 || \
                    docker network create ${DOCKER_NETWORK}
                '''

                echo 'Docker network is ready!'
            }
        }

        stage('Deploy Backend') {
            steps {
                sh '''
                    set -e

                    if [ ! -f /opt/freshmart/backend.env ]; then
                        echo "ERROR: Backend environment file not found!"
                        exit 1
                    fi

                    docker rm -f ${BACKEND_CONTAINER} || true

                    docker run -d \
                        --name ${BACKEND_CONTAINER} \
                        --restart unless-stopped \
                        --network ${DOCKER_NETWORK} \
                        --env-file /opt/freshmart/backend.env \
                        ${BACKEND_IMAGE}:${BUILD_NUMBER}

                    echo "Backend container started!"
                '''
            }
        }

        stage('Deploy Frontend') {
            steps {
                sh '''
                    set -e

                    docker rm -f ${FRONTEND_CONTAINER} || true

                    docker run -d \
                        --name ${FRONTEND_CONTAINER} \
                        --restart unless-stopped \
                        --network ${DOCKER_NETWORK} \
                        -p 80:80 \
                        ${FRONTEND_IMAGE}:${BUILD_NUMBER}

                    echo "Frontend container started!"
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    set -e

                    echo "Checking running containers..."

                    docker ps

                    docker inspect -f '{{.State.Status}}' \
                        ${BACKEND_CONTAINER}

                    docker inspect -f '{{.State.Status}}' \
                        ${FRONTEND_CONTAINER}

                    echo "Checking frontend HTTP response..."

                    for i in $(seq 1 15); do
                        if curl -fsS http://localhost/ >/dev/null; then
                            echo "Frontend is responding successfully!"
                            exit 0
                        fi

                        sleep 2
                    done

                    echo "ERROR: Frontend health check failed!"
                    exit 1
                '''
            }
        }
    }

    post {
        success {
            echo '''
            =========================================
               FRESHMART DEPLOYMENT SUCCESSFUL!
            =========================================

            Frontend: http://16.192.57.225
            Jenkins:  http://16.192.57.225:8080

            Both Docker images pushed to AWS ECR.
            Both application containers deployed.
            '''
        }

        failure {
            echo '''
            =========================================
               FRESHMART PIPELINE FAILED!
            =========================================

            Check the Jenkins Console Output
            to identify the failed stage.
            '''
        }

        always {
            echo 'FreshMart CI/CD pipeline execution completed.'
        }
    }
}
