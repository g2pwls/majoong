pipeline {
    agent any

    environment {
        BACKEND_DIR      = 'backend'
        FRONTEND_DIR     = 'frontend'
        DEV_BACK_CONTAINER   = 'majoong-backend-dev'
        DEV_FRONT_CONTAINER  = 'majoong-frontend-dev'
        PROD_BACK_CONTAINER  = 'majoong-backend-prod'
        PROD_FRONT_CONTAINER = 'majoong-frontend-prod'
        DEV_BACK_PORT    = '8081'
        DEV_FRONT_PORT   = '3001'
        PROD_BACK_PORT   = '8082'
        PROD_FRONT_PORT  = '3000'
        TEST_NETWORK     = 'test-network'
        PROD_NETWORK     = 'prod-network'
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
                    env.BRANCH_NAME  = params.GIT_REF.replaceFirst(/^refs\/heads\//, '')
                    echo "▶ Branch = ${env.BRANCH_NAME }"
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
                    // 네트워크가 없으면 생성
                    sh "docker network inspect ${TEST_NETWORK} >/dev/null 2>&1 || docker network create ${TEST_NETWORK}"
                    def TAG = sh(script: "git rev-parse --short=12 HEAD", returnStdout: true).trim()

                    if (env.BACK_CHANGED == 'true') {
                        sh """
                            docker build -f backend/Dockerfile -t majoong/backend-dev:${TAG} backend
                            docker rm -f ${DEV_BACK_CONTAINER} || true
                            docker run -d \
                              --name ${DEV_BACK_CONTAINER} \
                              --network ${TEST_NETWORK} \
                              --network-alias backend-test \
                              -p ${DEV_BACK_PORT}:8080 \
                              majoong/backend-dev:${TAG}
                        """
                    }

                    if (env.FRONT_CHANGED == 'true') {
                        sh """
                            docker build -f frontend/Dockerfile -t majoong/frontend-dev:${TAG} frontend
                            docker rm -f ${DEV_FRONT_CONTAINER} || true
                            docker run -d \
                              --name ${DEV_FRONT_CONTAINER} \
                              --network ${TEST_NETWORK} \
                              -p ${DEV_FRONT_PORT}:3000 \
                              majoong/frontend-dev:${TAG}
                        """
                    }
                }
            }
        }

        stage('Deploy to Prod') {
            when { expression { env.BRANCH_NAME == 'main' } }
            steps {
                script {
                    sh "docker network inspect ${PROD_NETWORK} >/dev/null 2>&1 || docker network create ${PROD_NETWORK}"
                    def TAG = sh(script: "git rev-parse --short=12 HEAD", returnStdout: true).trim()

                   if (env.BACK_CHANGED == 'true') {
                        sh """
                            docker build -f backend/Dockerfile -t majoong/backend-prod:${TAG} backend
                            docker tag majoong/backend-prod:${TAG} majoong/backend-prod:latest
                            docker rm -f ${PROD_BACK_CONTAINER} || true
                            docker run -d \
                            --name ${PROD_BACK_CONTAINER} \
                            --network ${PROD_NETWORK} \
                            --network-alias backend
                            -p ${PROD_BACK_PORT}:8080 \
                            majoong/backend-prod:latest
                        """
                    }

                    if (env.FRONT_CHANGED == 'true') {
                        sh """
                            docker build -f frontend/Dockerfile -t majoong/frontend-prod:${TAG} frontend
                            docker tag majoong/frontend-prod:${TAG} majoong/frontend-prod:latest
                            docker rm -f ${PROD_FRONT_CONTAINER} || true
                            docker run -d \
                            --name ${PROD_FRONT_CONTAINER} \
                            --network ${PROD_NETWORK} \
                            -p ${PROD_FRONT_PORT}:3000 \
                            majoong/frontend-prod:${TAG}
                        """
                    }
                }
            }
        }
    }

    post {
        success {
            script {
                def branch = sh(script: "git rev-parse --abbrev-ref HEAD", returnStdout: true).trim()
                def pusher = sh(script: "git --no-pager show -s --format='%an <%ae>' HEAD", returnStdout: true).trim()
                def mentionUser = env.GIT_PUSHER_USERNAME?.trim()   // ← 추가
                def displayPusher = mentionUser ? "@${mentionUser}" : pusher  // ← 추가

                sendMMText("빌드 성공 (${branch}) — pushed by ${displayPusher}", true)
            }
        }
        failure {
            script {
                def branch = sh(script: "git rev-parse --abbrev-ref HEAD", returnStdout: true).trim()
                def pusher = sh(script: "git --no-pager show -s --format='%an <%ae>' HEAD", returnStdout: true).trim()
                def mentionUser = env.GIT_PUSHER_USERNAME?.trim()   // ← 추가
                def displayPusher = mentionUser ? "@${mentionUser}" : pusher  // ← 추가

                def tail = currentBuild.rawBuild.getLog(200).join('\n').take(3500)

                sendMMCard(
                title : "빌드 실패",
                success: false,
                fields: [
                    [title:'Branch',    value: branch,        short:true],
                    [title:'Pushed By', value: displayPusher, short:true],   // ← 교체
                    [title:'Details',   value: "로그 (마지막 200줄):\n```\n${tail}\n```", short:false]
                    ]
                )
            }
        }
        always {
            echo "📦 Pipeline finished with status: ${currentBuild.currentResult}"
            sh "rm -f ${BACKEND_DIR}/src/main/resources/application.yml || true"
        }
    }
}

// ✅/❌ 상태 이모지 + 항상 :jenkins7: 아이콘
def sendMMText(String text, boolean success=true) {
  def statusEmoji = success ? "✅" : "❌"
  def payloadObj = [
    text     : "${statusEmoji} ${text}",
    username : "Jenkins",
    // ↓ 여기만 변경
    icon_url : "https://www.jenkins.io/images/logos/jenkins/jenkins.png"
  ]
  def json = groovy.json.JsonOutput.toJson(payloadObj)
  withCredentials([string(credentialsId: 'mattermost-webhook', variable: 'MM_WEBHOOK')]) {
    sh """
      curl -sS -X POST -H 'Content-Type: application/json' \
        --data '${json.replace("'", "'\\''")}' \
        "$MM_WEBHOOK"
    """
  }
}

def sendMMCard(Map args = [:]) {
  def success = (args.success == null) ? false : args.success
  def statusEmoji = success ? "✅" : "❌"
  def color = args.color ?: (success ? "#2ECC71" : "#E74C3C")
  def payloadObj = [
    username   : "Jenkins",
    icon_emoji : ":jenkins7:",
    attachments: [[
      fallback: "Jenkins Notification",
      color   : color,
      title   : "${statusEmoji} ${args.title ?: 'Build'}",
      fields  : (args.fields ?: [])
    ]]
  ]
  def json = groovy.json.JsonOutput.toJson(payloadObj)
  withCredentials([string(credentialsId: 'mattermost-webhook', variable: 'MM_WEBHOOK')]) {
    sh """
      curl -sS -X POST -H 'Content-Type: application/json' \
        --data '${json.replace("'", "'\\''")}' \
        "$MM_WEBHOOK"
    """
  }
}
