pipeline {
    agent any

    environment {
        BACKEND_DIR  = 'backend'
        FRONTEND_DIR = 'frontend'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {
        stage('Prepare Secret') {
            steps {
                sh "mkdir -p ${BACKEND_DIR}/src/main/resources"
                withCredentials([file(credentialsId: 'SECRETFILE', variable: 'APPLICATION_YML')]) {
                    sh 'cp $APPLICATION_YML ${BACKEND_DIR}/src/main/resources/application.yml'
                    sh 'chmod 600 ${BACKEND_DIR}/src/main/resources/application.yml'
                }
            }
        }

        stage('Detect Changes') {
            steps {
                script {
                    def range = env.GIT_PREVIOUS_SUCCESSFUL_COMMIT ? "${env.GIT_PREVIOUS_SUCCESSFUL_COMMIT}..HEAD" : "HEAD~1..HEAD"
                    def changedFiles = sh(script: "git diff --name-only ${range} || true", returnStdout: true).trim()

                    if (!changedFiles) {
                        echo "❎ 변경된 파일이 없습니다. 스킵합니다."
                        env.BACK_CHANGED  = 'false'
                        env.FRONT_CHANGED = 'false'
                    } else {
                        echo "📄 변경 파일 목록:\n${changedFiles}"
                        def lines = changedFiles.split('\\n') as List<String>
                        env.BACK_CHANGED  = (lines.any { it.startsWith('backend/') }).toString()
                        env.FRONT_CHANGED = (lines.any { it.startsWith('frontend/') }).toString()
                    }

                    echo "🔎 BACK_CHANGED=${env.BACK_CHANGED}, FRONT_CHANGED=${env.FRONT_CHANGED}, range=${range}"
                }
            }
        }

        stage('Detect Branch') {
            steps {
                script {
                    env.BRANCH_NAME = sh(
                        script: "git rev-parse --abbrev-ref HEAD",
                        returnStdout: true
                    ).trim()
                    echo "🔎 Current branch: ${env.BRANCH_NAME}"
                }
            }
        }

        stage('Nothing to Build') {
            when { expression { env.BACK_CHANGED != 'true' && env.FRONT_CHANGED != 'true' } }
            steps {
                echo "⏭️ 변경 없음 → 스킵"
                script { currentBuild.result = 'NOT_BUILT' }
            }
        }

        stage('Backend Build') {
            when { expression { env.BACK_CHANGED == 'true' } }
            steps {
                dir("${BACKEND_DIR}") {
                    sh '''
                        chmod +x ./gradlew
                        ./gradlew --no-daemon build -x test
                    '''
                }
            }
        }

        stage('Deploy to Dev') {
            when { expression { env.BRANCH_NAME == 'dev' } }
            steps {
                script {
                    def TAG = sh(script: "git rev-parse --short=12 HEAD", returnStdout: true).trim()

                    if (env.BACK_CHANGED == 'true') {
                        sh """
                            docker build -f backend/Dockerfile -t my-backend:${TAG} backend
                            docker rm -f my-backend-dev || true
                            docker run -d --name my-backend-dev -p 8081:8080 my-backend:${TAG}
                        """
                    }

                    if (env.FRONT_CHANGED == 'true') {
                        sh """
                            docker build -f frontend/Dockerfile -t my-frontend:${TAG} frontend
                            docker rm -f my-frontend-dev || true
                            docker run -d --name my-frontend-dev -p 3001:3000 my-frontend:${TAG}
                        """
                    }
                }
            }
        }

        stage('Deploy to Prod') {
            when { expression { env.BRANCH_NAME == 'main' } }
            steps {
                input message: "Deploy to Production?"
                script {
                    def TAG = sh(script: "git rev-parse --short=12 HEAD", returnStdout: true).trim()

                    if (env.BACK_CHANGED == 'true') {
                        sh """
                            docker build -f backend/Dockerfile -t my-backend:${TAG} backend
                            docker tag my-backend:${TAG} my-backend:latest
                            docker rm -f my-backend-prod || true
                            docker run -d --name my-backend-prod -p 8080:8080 my-backend:latest
                        """
                    }

                    if (env.FRONT_CHANGED == 'true') {
                        sh """
                            docker build -f frontend/Dockerfile -t my-frontend:${TAG} frontend
                            docker tag my-frontend:${TAG} my-frontend:latest
                            docker rm -f my-frontend-prod || true
                            docker run -d --name my-frontend-prod -p 3000:3000 my-frontend:latest
                        """
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
