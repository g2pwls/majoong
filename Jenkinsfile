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
            // ✅ 여기 추가: 두 개 웹훅 트리거를 Job 설정에 등록
        stage('Register Webhook Triggers') {
            steps {
                script {
                    // --- 두 개 웹훅 트리거 등록(DEV/MAIN) ---
                    properties([
                        pipelineTriggers([
                        // dev
                        [$class: 'GenericTrigger',
                            tokenCredentialId: 'majoong-dev',
                            genericVariables: [
                            [key: 'GIT_REF',             value: '$.ref'],
                            [key: 'GIT_PUSHER_USERNAME', value: '$.user_username'],
                            [key: 'GIT_COMMIT_URL',      value: '$.commits[0].url']
                            ],
                            regexpFilterText:       '$.ref',
                            regexpFilterExpression: '^refs/heads/dev$',
                            printContributedVariables: true,
                            printPostContent: true
                        ],
                        // main
                        [$class: 'GenericTrigger',
                            tokenCredentialId: 'majoong-main',
                            genericVariables: [
                            [key: 'GIT_REF',             value: '$.ref'],
                            [key: 'GIT_PUSHER_USERNAME', value: '$.user_username'],
                            [key: 'GIT_COMMIT_URL',      value: '$.commits[0].url']
                            ],
                            regexpFilterText:       '$.ref',
                            regexpFilterExpression: '^refs/heads/main$',
                            printContributedVariables: true,
                            printPostContent: true
                        ]
                        ])
                    ])
                }
            }
    }
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
                def tail      = currentBuild.rawBuild.getLog(200).join('\n').take(6000)
                sendMMNotify(false, [
                    branch   : branch,
                    mention  : mention,
                    buildUrl : env.BUILD_URL,
                    commit   : [msg: commitMsg, url: commitUrl],
                    details  : "```\n${tail}\n```"    // 실패시에만 표시
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

// 커스텀 이모지 + 제목(큰 글씨) + 줄 단위 본문
// success=true면 Status: ✅ Success, false면 Status: ❌ Failed
def sendMMNotify(boolean success, Map info) {
  def statusLine = success ? "Status: ✅ Success" : "Status: ❌ Failed"
  def titleLine  = "# :jenkins7: Jenkins Notification"     // ← 큰 글씨 제목 (H1)
  def lines = []

  // 2줄째: 상태
  lines << statusLine
  // 3줄째: @username 또는 작성자
  if (info.mention) lines << "${info.mention}"
  // 4줄째: 타깃 브랜치
  if (info.branch)  lines << "Target Branch: `${info.branch}`"
  // 5줄째: 커밋/빌드 링크(있을 때)
  if (info.commit?.msg) {
    def commitLine = info.commit?.url ? "[${info.commit.msg}](${info.commit.url})" : info.commit.msg
    lines << "Commit: ${commitLine}"
  }
  if (info.buildUrl) lines << "Build: [Open Build](${info.buildUrl})"
  // 실패면 추가 내용(로그 등)
  if (!success && info.details) lines << "Error:\n${info.details}"

  def text = "${titleLine}\n\n" + lines.join("\n")

  // JSON 파일로 저장 후 --data-binary 로 전송(크리덴셜 경고 방지)
  writeFile file: 'payload.json', text: groovy.json.JsonOutput.toJson([
    text      : text,
    username  : "Jenkins",
    icon_emoji: ":jenkins7:"     // 프로필 아이콘도 커스텀 이모지 사용
  ])

  withCredentials([string(credentialsId: 'mattermost-webhook', variable: 'MM_WEBHOOK')]) {
    sh(script: '''
      curl -sS -f -X POST -H 'Content-Type: application/json' \
        --data-binary @payload.json \
        "$MM_WEBHOOK"
    ''')
  }
}
