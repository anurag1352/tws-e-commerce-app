pipeline{
    agent any
    
     environment {
        SCANNER_HOME = tool 'sonar-scanner'
    }
    
    stages{
        stage('Clean Workspace'){
            steps{
                cleanWs()
            }
        }
        stage('Clone Repo'){
            steps{
                git url: 'https://github.com/anurag1352/tws-e-commerce-app.git', branch: 'master'
            }
        }
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('Sonar') {
                    sh ''' $SCANNER_HOME/bin/sonar-scanner -Dsonar.projectName=e-commerce-Project \
                            -Dsonar.projectKey=e-commerce-Project '''
                }
            }
        }
         stage('Quality Gate Check') {
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    waitForQualityGate abortPipeline: false, credentialsId: 'sonar-token'
                }
            }
        }
        stage('Build Docker Image'){
            steps{
                sh 'docker build -t e-commerce .'
            }
        }
        stage('Build Migrate Image') {
            steps {
                sh 'docker build -t tws-migration -f scripts/Dockerfile.migration .'
            }
        }
         stage("Trivy: Filesystem scan"){
            steps{
                script{
                    trivy_scan()
                }
            }
        }
        stage('run test'){
            steps{
                echo "Testing Start.."
                echo "Testing Done..."
            }
        }
        stage('Push To DockerHub'){
            steps{
                withCredentials([usernamePassword(credentialsId: "docker_creds", passwordVariable: "dockerHubPass", usernameVariable: "dockerHubUser")]){
                    sh "docker login -u ${env.dockerHubUser} -p ${env.dockerHubPass}"
                    sh "docker image tag e-commerce:latest ${env.dockerHubUser}/e-commerce:latest"
                    sh "docker push ${env.dockerHubUser}/e-commerce:latest"
                }
            }
        }
        stage('Deploy To Server'){
            steps{
                sh 'docker-compose down && docker-compose up -d'
            }
        }
    }
}
