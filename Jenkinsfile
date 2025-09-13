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
        LOG_FILE = 'ci.log'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {
        stage('Init Log') {
            steps {
                sh '''
                set -eu
                : "${WORKSPACE:?}"
                rm -f "$WORKSPACE/${LOG_FILE:-ci.log}" || true
                touch "$WORKSPACE/${LOG_FILE:-ci.log}"
                '''
            }
        }
        stage('Prepare Secret') {
            steps {
                sh "mkdir -p ${BACKEND_DIR}/src/main/resources"
                withCredentials([file(credentialsId: 'SECRETFILE', variable: 'APPLICATION_YML')]) {
                    sh """
                      set -eu
                      cp "\$APPLICATION_YML" "${BACKEND_DIR}/src/main/resources/application.yml" >> "\$WORKSPACE/${LOG_FILE}" 2>&1
                      chmod 600 "${BACKEND_DIR}/src/main/resources/application.yml"             >> "\$WORKSPACE/${LOG_FILE}" 2>&1
                    """
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
                    script {
                        try {
                            sh """#!/usr/bin/env bash
                            set -Eeuo pipefail
                            chmod +x ./gradlew                                   >> "\$WORKSPACE/${LOG_FILE}" 2>&1
                            set -x
                            ./gradlew --no-daemon build -x test --stacktrace --warning-mode all --info \
                            2>&1 | tee -a "\$WORKSPACE/${LOG_FILE}"
                            ec=\${PIPESTATUS[0]}
                            set +x
                            echo "[GRADLE_EXIT_CODE] \${ec}"                    >> "\$WORKSPACE/${LOG_FILE}" 2>&1
                            exit "\${ec}"
                            """
                        } catch (err) {
                            sh "echo '[ERROR] Backend Build failed: ${err}' >> $WORKSPACE/${LOG_FILE}"
                            throw err  // 실패를 파이프라인에 전파
                        }
                    }
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
                        script {
                            try {
                                sh """
                                    docker build -f backend/Dockerfile -t majoong/backend-dev:${TAG} backend >> "\$WORKSPACE/${LOG_FILE}" 2>&1
                                    docker rm -f ${DEV_BACK_CONTAINER} || true                                >> "\$WORKSPACE/${LOG_FILE}" 2>&1
                                    docker run -d \
                                      --name ${DEV_BACK_CONTAINER} \
                                      --network ${TEST_NETWORK} \
                                      --network-alias backend-test \
                                      -p ${DEV_BACK_PORT}:8080 \
                                      majoong/backend-dev:${TAG}                                             >> "\$WORKSPACE/${LOG_FILE}" 2>&1
                                """
                            } catch(err) {
                                sh "echo '[ERROR] Backend Deploy to Dev failed: ${err}' >> $WORKSPACE/${LOG_FILE}"
                                throw err
                            }

                        }
                    }

                    if (env.FRONT_CHANGED == 'true') {
                        script {
                            try {
                                sh """
                                    docker build -f frontend/Dockerfile -t majoong/frontend-dev:${TAG} frontend >> "\$WORKSPACE/${LOG_FILE}" 2>&1
                                    docker rm -f ${DEV_FRONT_CONTAINER} || true                                  >> "\$WORKSPACE/${LOG_FILE}" 2>&1
                                    docker run -d \
                                      --name ${DEV_FRONT_CONTAINER} \
                                      --network ${TEST_NETWORK} \
                                      -p ${DEV_FRONT_PORT}:3000 \
                                      majoong/frontend-dev:${TAG}                                               >> "\$WORKSPACE/${LOG_FILE}" 2>&1
                                """
                            } catch (err) {
                                sh "echo '[ERROR] Frontend Deploy to Dev failed: ${err}' >> $WORKSPACE/${LOG_FILE}"
                                throw err
                            }
                        }
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
                        script {
                            try {
                                sh """
                                    docker build -f backend/Dockerfile -t majoong/backend-prod:${TAG} backend  >> "\$WORKSPACE/${LOG_FILE}" 2>&1
                                    docker tag majoong/backend-prod:${TAG} majoong/backend-prod:latest         >> "\$WORKSPACE/${LOG_FILE}" 2>&1
                                    docker rm -f ${PROD_BACK_CONTAINER} || true                                 >> "\$WORKSPACE/${LOG_FILE}" 2>&1
                                    docker run -d \
                                      --name ${PROD_BACK_CONTAINER} \
                                      --network ${PROD_NETWORK} \
                                      --network-alias backend \
                                      -p ${PROD_BACK_PORT}:8080 \
                                      majoong/backend-prod:latest                                              >> "\$WORKSPACE/${LOG_FILE}" 2>&1
                                """
                            } catch(err) {
                                sh "echo '[ERROR] Backend Deploy to main failed: ${err}' >> $WORKSPACE/${LOG_FILE}"
                                throw err
                            }
                        }
                    }

                    if (env.FRONT_CHANGED == 'true') {
                        script {
                            try {
                                sh """
                                    docker build -f frontend/Dockerfile -t majoong/frontend-prod:${TAG} frontend >> "\$WORKSPACE/${LOG_FILE}" 2>&1
                                    docker tag majoong/frontend-prod:${TAG} majoong/frontend-prod:latest         >> "\$WORKSPACE/${LOG_FILE}" 2>&1
                                    docker rm -f ${PROD_FRONT_CONTAINER} || true                                  >> "\$WORKSPACE/${LOG_FILE}" 2>&1
                                    docker run -d \
                                      --name ${PROD_FRONT_CONTAINER} \
                                      --network ${PROD_NETWORK} \
                                      -p ${PROD_FRONT_PORT}:3000 \
                                      majoong/frontend-prod:latest                                               >> "\$WORKSPACE/${LOG_FILE}" 2>&1
                                """

                            } catch(err) {
                                sh "echo '[ERROR] Frontend Deploy to Main failed: ${err}' >> $WORKSPACE/${LOG_FILE}"
                                throw err
                            }
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            script {
                def branch    = resolveBranch()
                def mention   = resolvePusherMention()         // @username 또는 빈 문자열
                def commitMsg = sh(script: "git log -1 --pretty=%s", returnStdout: true).trim()
                def commitUrl = env.GIT_COMMIT_URL ?: ""
                sendMMNotify(true, [
                    branch   : branch,
                    mention  : mention,
                    buildUrl : env.BUILD_URL,
                    commit   : [msg: commitMsg, url: commitUrl],
                    // 실패가 아니므로 details 생략
                ])
            }
        } 
        failure {
            script {
                def branch    = resolveBranch()
                def mention   = resolvePusherMention()
                def commitMsg = sh(script: "git log -1 --pretty=%s", returnStdout: true).trim()
                def commitUrl = env.GIT_COMMIT_URL ?: ""

                // ci.log이 있으면 마지막 200줄, 없으면 빈 문자열
                def tail = sh(
                    script: "tail -n 200 \"$WORKSPACE/${LOG_FILE}\" 2>/dev/null || true",
                    returnStdout: true
                ).trim()

                // (선택) 민감정보 간단 마스킹
                tail = tail
                    .replaceAll(/(?i)(token|secret|password|passwd|apikey|api_key)\s*[:=]\s*\S+/, '$1=[REDACTED]')
                    .replaceAll(/AKIA[0-9A-Z]{16}/, 'AKIA[REDACTED]')

                def detailsBlock = tail ? "```\n${tail}\n```" : ""

                sendMMNotify(false, [
                    branch   : branch,
                    mention  : mention,
                    buildUrl : env.BUILD_URL,
                    commit   : [msg: commitMsg, url: commitUrl],
                    details  : detailsBlock
                ])
            }
        }
        always {
            echo "📦 Pipeline finished with status: ${currentBuild.currentResult}"
            sh "rm -f ${BACKEND_DIR}/src/main/resources/application.yml || true"
        }
    }
}

// 브랜치 해석: BRANCH_NAME → GIT_REF → git
def resolveBranch() {
  if (env.BRANCH_NAME) return env.BRANCH_NAME
  if (env.GIT_REF) return env.GIT_REF.replaceFirst(/^refs\/heads\//,'')
  return sh(script: "git name-rev --name-only HEAD || git rev-parse --abbrev-ref HEAD", returnStdout: true).trim()
}

// @username (웹훅의 user_username) 우선, 없으면 커밋 작성자 표시
def resolvePusherMention() {
  def u = env.GIT_PUSHER_USERNAME?.trim()
  if (u) return "@${u}"
  return sh(script: "git --no-pager show -s --format='%an <%ae>' HEAD", returnStdout: true).trim()
}

// ✅/❌ 제목을 "## :jenkins7: Jenkins Build Success ✅ / Failed ❌" 로 출력하고
// 아래에 pusher / Target Branch / Commit (실패 시 Error)만 표시
def sendMMNotify(boolean success, Map info) {
  def titleLine = success ? "## :jenkins7: Jenkins Build Success"
                          : "## :angry_jenkins: Jenkins Build Failed"

  def lines = []
  if (info.mention) lines << "**Author**: ${info.mention}"
  if (info.branch)  lines << "**Target Branch**: `${info.branch}`"
  if (info.commit?.msg) {
    def commitLine = info.commit?.url ? "[${info.commit.msg}](${info.commit.url})" : info.commit.msg
    lines << "**Commit**: ${commitLine}"
  }
  if (!success && info.details) {
    lines << "**Error Message**:\n${info.details}"
  }

  def text = "${titleLine}\n" + (lines ? ("\n" + lines.join("\n")) : "")

  // 안전 전송(크리덴셜 경고 없음)
  writeFile file: 'payload.json', text: groovy.json.JsonOutput.toJson([
    text      : text,
    username  : "Jenkins",
    icon_emoji: ":jenkins7:"
  ])
  withCredentials([string(credentialsId: 'mattermost-webhook', variable: 'MM_WEBHOOK')]) {
    sh(script: '''
      curl -sS -f -X POST -H 'Content-Type: application/json' \
        --data-binary @payload.json \
        "$MM_WEBHOOK"
    ''')
  }
}
