pipeline {
    agent none

    environment {
        APP_NAME = 'jenkins-multicontainer-app'
        DOCKER_COMPOSE_FILE = 'docker/docker-compose.test.yml'
        TEST_REPORT_DIR = 'coverage'
    }

    stages {
        stage('Preparación del Entorno') {
            agent { label 'docker' }
            steps {
                echo ' 📦 Clonando repositorio...'
                checkout scm

                echo ' 🔧 Verificando herramientas...'
                sh 'docker --version'
                sh 'docker-compose --version'
                sh 'node --version'
                sh 'npm --version'
            }
        }

        stage('Instalación de Dependencias') {
            agent {
                docker {
                    image 'node:18-alpine'
                    args '-u root'
                }
            }
            steps {
                echo ' 📥 Instalando dependencias...'
                sh 'npm ci'
                sh 'npm install -g jest'
            }
        }

        stage('Pruebas Unitarias') {
            agent {
                docker {
                    image 'node:18-alpine'
                    args '-u root'
                }
            }
            steps {
                echo ' 🧪 Ejecutando pruebas unitarias...'
                sh 'npm run test:unit -- --coverage'
            }
            post {
                always {
                    junit 'coverage/junit.xml'
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage/lcov-report/',
                        reportFiles: 'index.html',
                        reportName: 'Unit Test Coverage'
                    ])
                }
            }
        }

        stage('Pruebas de Integración con Servicios') {
            agent { label 'docker' }
            steps {
                echo ' 🐳 Levantando servicios con Docker Compose...'
                script {
                    // Iniciar servicios
                    sh """
                    docker-compose -f ${DOCKER_COMPOSE_FILE} up -d
                    sleep 10
                    """

                    // Esperar a que los servicios estén listos
                    sh '''
                    echo "Esperando PostgreSQL..."
                    timeout 30 sh -c "while ! docker-compose -f ${DOCKER_COMPOSE_FILE} exec postgres pg_isready; do sleep 1; done"

                    echo "Esperando Redis..."
                    timeout 30 sh -c "while ! docker-compose -f ${DOCKER_COMPOSE_FILE} exec redis redis-cli ping; do sleep 1; done"
                    '''

                    // Ejecutar pruebas de integración dentro del contenedor app
                    sh """
                    docker-compose -f ${DOCKER_COMPOSE_FILE} exec -T app npm run test:integration -- --coverage
                    """
                }
            }
            post {
                always {
                    junit 'coverage/junit.xml'
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage/lcov-report/',
                        reportFiles: 'index.html',
                        reportName: 'Integration Test Coverage'
                    ])

                    echo ' 🧹 Limpiando contenedores...'
                    sh "docker-compose -f ${DOCKER_COMPOSE_FILE} down -v"
                }
                failure {
                    echo ' ❌ Pruebas de integración fallaron. Revisa los logs.'
                }
            }
        }

        stage('Prueba End-to-End') {
            agent { label 'docker' }
            when {
                expression { env.BRANCH_NAME == 'main' }
            }
            steps {
                echo ' 🌐 Ejecutando pruebas end-to-end...'
                script {
                    // Levantar servicios en modo producción
                    sh """
                    docker-compose -f ${DOCKER_COMPOSE_FILE} up -d
                    sleep 10
                    """

                    // Probar endpoints reales
                    sh """
                    curl -f http://localhost:3000/health || exit 1
                    curl -X POST http://localhost:3000/users \\
                        -H "Content-Type: application/json" \\
                        -d '{"name":"E2E Test","email":"e2e@test.com"}' || exit 1
                    """
                }
            }
            post {
                always {
                    sh "docker-compose -f ${DOCKER_COMPOSE_FILE} down -v"
                }
            }
        }
    }

    post {
        success {
            echo ' ✅ Pipeline completado exitosamente'
            emailext (
                subject: " ✅ Pipeline exitoso: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
                El pipeline multi-contenedor se completó correctamente.
                URL: ${env.BUILD_URL}
                Reportes de cobertura disponibles en:
                - ${env.BUILD_URL}/coverage/
                """,
                to: 'equipo-dev@ejemplo.com'
            )
        }
        failure {
            echo ' ❌ Pipeline falló. Revisa los logs.'
            emailext (
                subject: " ❌ Pipeline fallido: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
                El pipeline multi-contenedor falló.
                Revisa los logs en: ${env.BUILD_URL}
                """,
                to: 'equipo-dev@ejemplo.com'
            )
        }
        always {
            echo ' 🧹 Limpiando workspace...'
            cleanWs()
        }
    }
}