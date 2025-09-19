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
                echo "🗒️  Init Log: 워크스페이스 로그 파일 초기화"
                sh '''
                set -eu
                : "${WORKSPACE:?}"
                rm -f "$WORKSPACE/${LOG_FILE:-ci.log}" || true
                touch "$WORKSPACE/${LOG_FILE:-ci.log}"
                echo "[INIT] ci.log created at $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$WORKSPACE/${LOG_FILE:-ci.log}"
                '''
            }
        }

        stage('Detect Changes') {
            steps {
                echo "🔍 Detect Changes: 변경 파일 스캔"
                script {
                    def range = env.GIT_PREVIOUS_SUCCESSFUL_COMMIT ? "${env.GIT_PREVIOUS_SUCCESSFUL_COMMIT}..HEAD" : "HEAD~1..HEAD"
                    def changedFiles = sh(script: "git diff --name-only ${range} || true", returnStdout: true).trim()

                    if (!changedFiles) {
                        echo "❎ 변경된 파일이 없습니다. 스킵합니다."
                        env.BACK_CHANGED  = 'false'
                        env.FRONT_CHANGED = 'false'
                        env.CHAIN_CHANGED  = 'false'
                    } else {
                        echo "📄 변경 파일 목록:\n${changedFiles}"
                        def lines = changedFiles.split('\\n') as List<String>
                        env.BACK_CHANGED  = (lines.any { it.startsWith('backend/') }).toString()
                        env.FRONT_CHANGED = (lines.any { it.startsWith('frontend/') }).toString()
                        env.CHAIN_CHANGED  = (lines.any { it.startsWith('blockchain/') }).toString()
                    }

                    echo "🧭 변경 요약 → BACK_CHANGED=${env.BACK_CHANGED}, FRONT_CHANGED=${env.FRONT_CHANGED}, CHAIN_CHANGED=${env.CHAIN_CHANGED}, range=${range}."
                }
            }
        }

        stage('Detect Branch') {
            steps {
                echo "🌿 Detect Branch: 브랜치 이름 확인"
                script {
                    def resolved = env.BRANCH_NAME?.trim()
                    if (!resolved) {
                        resolved = env.GIT_REF?.replaceFirst(/^refs\\/heads\\//,'')?.trim()
                    }
                    if (!resolved) {
                        resolved = sh(script: "git name-rev --name-only HEAD || git rev-parse --abbrev-ref HEAD",
                                      returnStdout: true).trim()
                    }
                    env.BRANCH_NAME = resolved
                    echo "▶ Active Branch = ${env.BRANCH_NAME}"
                }
            }
        }

        stage('Prepare Secret') {
            steps {
                echo "🔐 Prepare Secret: application.yml 주입"
                sh "mkdir -p ${BACKEND_DIR}/src/main/resources"
                script {
                    if (env.BRANCH_NAME == 'main') {
                        echo "🔏 환경: prod (main)"
                        withCredentials([file(credentialsId: 'SECRETFILE_PROD', variable: 'ENV_YML')]) {
                        sh """
                            set -eu
                            cp "\$ENV_YML" "${env.BACKEND_DIR}/src/main/resources/application.yml" >> "\$WORKSPACE/${LOG_FILE}" 2>&1
                            chmod 600 "${env.BACKEND_DIR}/src/main/resources/application.yml"      >> "\$WORKSPACE/${LOG_FILE}" 2>&1
                            echo "[SECRET] prod application.yml installed"                          >> "\$WORKSPACE/${LOG_FILE}"
                        """
                        }
                    } else if (env.BRANCH_NAME == 'dev') {
                        echo "🔏 환경: dev (dev)"
                        withCredentials([file(credentialsId: 'SECRETFILE_DEV', variable: 'ENV_YML')]) {
                        sh """
                            set -eu
                            cp "\$ENV_YML" "${env.BACKEND_DIR}/src/main/resources/application.yml"  >> "\$WORKSPACE/${LOG_FILE}" 2>&1
                            chmod 600 "${env.BACKEND_DIR}/src/main/resources/application.yml"       >> "\$WORKSPACE/${LOG_FILE}" 2>&1
                            echo "[SECRET] dev application.yml installed"                           >> "\$WORKSPACE/${LOG_FILE}"
                        """
                        }
                    } else {
                        echo "ℹ️ main/dev 외 브랜치: 시크릿 복사 생략"
                    }
                }
            }
        }

        stage('Nothing to Build') {
            when { expression { env.BACK_CHANGED != 'true' && env.FRONT_CHANGED != 'true' && env.CHAIN_CHANGED != 'true' } }
            steps {
                echo "⏭️ 변경 없음 → 모든 빌드 단계 스킵"
                script { currentBuild.result = 'NOT_BUILT' }
            }
        }

        stage('Backend Build') {
            when { expression { env.BACK_CHANGED == 'true' } }
            steps {
                echo "🛠️ Backend Build: Gradle 빌드 시작"
                dir("${BACKEND_DIR}") {
                    script {
                        try {
                            sh """#!/usr/bin/env bash
                            set -Eeuo pipefail
                            echo "[BACKEND] build start"                        >> "\$WORKSPACE/${LOG_FILE}"
                            chmod +x ./gradlew                                   >> "\$WORKSPACE/${LOG_FILE}" 2>&1
                            set -x
                            ./gradlew --no-daemon build -x test --stacktrace --warning-mode all --info \
                            2>&1 | tee -a "\$WORKSPACE/${LOG_FILE}"
                            ec=\${PIPESTATUS[0]}
                            set +x
                            echo "[BACKEND] build exit=\${ec}"                  >> "\$WORKSPACE/${LOG_FILE}"
                            exit "\${ec}"
                            """
                            echo "✅ Backend Build: 성공"
                        } catch (err) {
                            sh "echo '[ERROR] Backend Build failed: ${err}' >> \"$WORKSPACE/${LOG_FILE}\""
                            echo "❌ Backend Build: 실패"
                            throw err
                        }
                    }
                }
            }
        }

        stage('Prepare Env Files') {
            steps {
                echo "🧩 Prepare Env Files: blockchain/frontend .env 주입"
                script {
                    // 디렉토리 보장
                    sh 'mkdir -p blockchain frontend'

                    // 1) blockchain/.env 주입
                    withCredentials([file(credentialsId: 'ENV_BLOCKCHAIN', variable: 'BLOCK_ENV')]) {
                        sh '''
                        install -m 600 -T "$BLOCK_ENV" "blockchain/.env"
                        echo "[ENV] blockchain/.env installed"
                        '''
                    }

                    // 2) frontend/.env 주입 (브랜치별 분기)
                    String credId
                    String envName
                    if (env.BRANCH_NAME == 'main') {
                        credId  = 'FRONT_ENV_PROD'     // Jenkins에 등록된 .env.production 시크릿 파일
                        envName = '.env.production'
                        echo "Using frontend ${envName}"
                    } else if (env.BRANCH_NAME == 'dev') {
                        credId  = 'FRONT_ENV_DEV'      // Jenkins에 등록된 .env.development 시크릿 파일
                        envName = '.env.development'
                        echo "Using frontend ${envName}"
                    } else {
                        error "❌ Unknown branch: ${env.BRANCH_NAME}. Expected 'dev' or 'main'."
                    }

                    withCredentials([file(credentialsId: credId, variable: 'FRONT_ENV')]) {
                        sh '''
                        # frontend/.env
                        install -m 640 -T "$FRONT_ENV" "frontend/.env"
                        echo "[ENV] frontend/.env installed"

                        chown -f 1000:1000 frontend/.env || true
                        '''
                    }
                }
            }
        }

        stage('Hardhat Setup & Compile') {
            when { expression { return env.CHAIN_CHANGED == 'true' } }
            steps {
                echo "⛓️ Hardhat: Node/NPM 설정 및 컴파일"
                dir('blockchain') {
                    sh '''#!/usr/bin/env bash
                    set -Eeuo pipefail
                    echo "[CHAIN] setup start"

                    export NVM_DIR="$HOME/.nvm"
                    if [ ! -s "$NVM_DIR/nvm.sh" ]; then
                        echo "[CHAIN] installing nvm ..."
                        curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
                    fi
                    . "$NVM_DIR/nvm.sh"

                    nvm install 20
                    nvm use 20

                    node -v
                    npm -v

                    export CI=true
                    npm ci --no-audit --no-fund
                    npx hardhat compile

                    echo "[CHAIN] compile done"
                    '''
                }
                echo "✅ Hardhat: 컴파일 완료"
            }
        }

        stage('Deploy to Dev') {
            when { expression { env.BRANCH_NAME == 'dev' } }
            steps {
                echo "🚀 Deploy to Dev: DEV 네트워크/컨테이너 준비"
                script {
                    // 네트워크가 없으면 생성
                    sh "docker network inspect ${TEST_NETWORK} >/dev/null 2>&1 || docker network create ${TEST_NETWORK}"
                    def TAG = sh(script: "git rev-parse --short=12 HEAD", returnStdout: true).trim()

                    if (env.BACK_CHANGED == 'true') {
                        echo "📦 DEV Backend: 이미지 빌드 및 컨테이너 실행"
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
                                echo "✅ DEV Backend: 배포 완료 (tag=${TAG})"
                            } catch(err) {
                                sh "echo '[ERROR] Backend Deploy to Dev failed: ${err}' >> \"$WORKSPACE/${LOG_FILE}\""
                                echo "❌ DEV Backend: 배포 실패"
                                throw err
                            }
                        }
                    }

                    if (env.FRONT_CHANGED == 'true') {
                        echo "🖥️ DEV Frontend: 이미지 빌드 및 컨테이너 실행"
                        script {
                            try {
                                sh """
                                    docker build -f frontend/Dockerfile -t majoong/frontend-dev:${TAG} frontend >> "\$WORKSPACE/${LOG_FILE}" 2>&1
                                    docker rm -f ${DEV_FRONT_CONTAINER} || true                                  >> "\$WORKSPACE/${LOG_FILE}" 2>&1
                                    docker run -d \
                                      --name ${DEV_FRONT_CONTAINER} \
                                      --network ${TEST_NETWORK} \
                                      -p ${DEV_FRONT_PORT}:3000 \
                                      --env-file "$WORKSPACE/frontend/.env" \
                                      -v next_cache_dev:/app/.next/cache \
                                      --restart unless-stopped \
                                      majoong/frontend-dev:${TAG}                                               >> "\$WORKSPACE/${LOG_FILE}" 2>&1
                                """
                                echo "✅ DEV Frontend: 배포 완료 (tag=${TAG})"
                            } catch (err) {
                                sh "echo '[ERROR] Frontend Deploy to Dev failed: ${err}' >> \"$WORKSPACE/${LOG_FILE}\""
                                echo "❌ DEV Frontend: 배포 실패"
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
                echo "🚀 Deploy to Prod: PROD 네트워크/컨테이너 준비"
                script {
                    sh "docker network inspect ${PROD_NETWORK} >/dev/null 2>&1 || docker network create ${PROD_NETWORK}"
                    def TAG = sh(script: "git rev-parse --short=12 HEAD", returnStdout: true).trim()

                   if (env.BACK_CHANGED == 'true') {
                        echo "📦 PROD Backend: 이미지 빌드/태깅 및 컨테이너 실행"
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
                                      majoong/backend-prod:${TAG}                                              >> "\$WORKSPACE/${LOG_FILE}" 2>&1
                                """
                                echo "✅ PROD Backend: 배포 완료 (tag=${TAG})"
                            } catch(err) {
                                sh "echo '[ERROR] Backend Deploy to main failed: ${err}' >> \"$WORKSPACE/${LOG_FILE}\""
                                echo "❌ PROD Backend: 배포 실패"
                                throw err
                            }
                        }
                    }

                    if (env.FRONT_CHANGED == 'true') {
                        echo "🖥️ PROD Frontend: 이미지 빌드/태깅 및 컨테이너 실행"
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
                                      --env-file "$WORKSPACE/frontend/.env" \
                                      -v next_cache_prod:/app/.next/cache \
                                      --restart unless-stopped \
                                      majoong/frontend-prod:${TAG}                                               >> "\$WORKSPACE/${LOG_FILE}" 2>&1
                                """
                                echo "✅ PROD Frontend: 배포 완료 (tag=${TAG})"
                            } catch(err) {
                                sh "echo '[ERROR] Frontend Deploy to Main failed: ${err}' >> \"$WORKSPACE/${LOG_FILE}\""
                                echo "❌ PROD Frontend: 배포 실패"
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
            echo "🎉 POST: 빌드 성공 – Mattermost 알림 전송"
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
            echo "🚨 POST: 빌드 실패 – 로그 tail 후 Mattermost 알림 전송"
            script {
                def branch    = resolveBranch()
                def mention   = resolvePusherMention()
                def commitMsg = sh(script: "git log -1 --pretty=%s", returnStdout: true).trim()
                def commitUrl = env.GIT_COMMIT_URL ?: ""

                // ci.log이 있으면 마지막 200줄, 없으면 빈 문자열
                def tail = sh(
                    script: "tail -n 150 \"$WORKSPACE/${LOG_FILE}\" 2>/dev/null || true",
                    returnStdout: true
                ).trim()

                // (선택) 민감정보 간단 마스킹
                tail = tail
                    .replaceAll(/(?i)(token|secret|password|passwd|apikey|api_key)\\s*[:=]\\s*\\S+/, '$1=[REDACTED]')
                    .replaceAll(/AKIA[0-9A-Z]{16}/, 'AKIA[REDACTED]')

                def detailsBlock = tail ? "```text\n${tail}\n```" : ""

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
            echo "📦 Pipeline finished with status: ${currentBuild.currentResult} – 🔥 민감 파일 정리"
            sh "rm -f ${env.BACKEND_DIR}/src/main/resources/application.yml || true"
            sh "rm -f blockchain/.env frontend/.env || true"
            echo "🧹 Cleanup: application.yml/.env 삭제 완료"
        }
    }
}

// 브랜치 해석: BRANCH_NAME → GIT_REF → git
def resolveBranch() {
  if (env.BRANCH_NAME) return env.BRANCH_NAME
  if (env.GIT_REF) return env.GIT_REF.replaceFirst(/^refs\\/heads\\//,'')
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
