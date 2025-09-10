pipeline {
    agent any
    environment {
        BACKEND_DIR = 'backend'
        FRONTEND_DIR = 'frontend'
    }
    stages {
        stage('Prepare') {
            steps {
                withCredentials([file(credentialsId: 'SECRETFILE', variable: 'APPLICATION_YML')]) {
                sh 'cp "$APPLICATION_YML" "${BACKEND_DIR}/src/main/resources/application.yml"'
                }
            }
        }
        // -----------------
        // Backend Build
        // -----------------
        stage('Backend Build') {
            when {
                expression {
                    return fileChanged('backend/')
                }
            }
            steps {
                dir(BACKEND_DIR) {
                    sh '''
                    chmod +x ./gradlew
                    ./gradlew --no-daemon build -x test
                    '''
                }
            }
        }

        stage('Frontend Build') {
            when {
                expression {
                    return fileChanged('frontend/')
                }
            }
            steps {
                dir(FRONTEND_DIR) {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Deploy to Dev') {
            when { branch 'dev' }
            steps {
                script {
                    if(fileChanged('backend/')) {
                        sh 'docker build -t my-backend:dev backend -f backend/Dockerfile'
                        sh 'docker run -d --rm -p 8081:8080 my-backend:dev'
                    }
                    if(fileChanged('frontend/')) {
                        sh 'docker build -t my-frontend:dev frontend -f frontend/Dockerfile'
                        sh 'docker run -d --rm -p 3000:3000 my-frontend:dev'
                    }
                }
            }
        }

        stage('Deploy to Prod') {
            when { branch 'main' }
            steps {
                input message: "Deploy to Production?"
                script {
                    if(fileChanged('backend/')) {
                        sh 'docker build -t my-backend:latest backend -f backend/Dockerfile'
                        sh 'docker run -d --rm -p 8080:8080 my-backend:latest'
                    }
                    if(fileChanged('frontend/')) {
                        sh 'docker build -t my-frontend:latest frontend -f frontend/Dockerfile'
                        sh 'docker run -d --rm -p 3000:3000 my-frontend:latest'
                    }
                }
            }
        }
    }

    post {
        always {
        echo "📦 Pipeline finished with status: ${currentBuild.currentResult}"
        sh "rm -f ${BACKEND_DIR}/src/main/resources/application.yml || true"
        }
    }
}


def fileChanged(String folder) {
    return sh(
        script: "git diff --name-only HEAD~1 HEAD | grep '^${folder}' || true",
        returnStatus: true
    ) == 0
}

