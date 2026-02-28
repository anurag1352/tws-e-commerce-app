pipeline {
    agent any
    
      environment {
        SCANNER_HOME = tool 'sonar-scanner'
    }

    stages {
        stage('Clean WorkSpace') {
            steps {
                cleanWs()
            }
        }
        stage('Git Clone'){
            steps{
                git url: 'https://github.com/anurag1352/tws-e-commerce-app.git', branch: 'master'
            }
        }
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('Sonar') {
                    sh ''' $SCANNER_HOME/bin/sonar-scanner -Dsonar.projectName=easyshop-Project \
                            -Dsonar.projectKey=easyshop-Project '''
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
        stage('Build'){
            steps{
                sh 'docker build -t easyshop .'
            }
        }
        stage('Test'){
            steps{
                echo "Testing Start"
                echo "Testing Complete"
            }
        }
        stage("Trivy: Filesystem scan"){
            steps{
                script{
                    sh 'trivy fs --format table -o fs-report.html .'
                }
            }
        }
        stage('Push To DockerHub'){
            steps{
                withCredentials([usernamePassword(credentialsId: "docker_creds", passwordVariable: "dockerHubPass", usernameVariable: "dockerHubUser")]){
                    sh "docker login -u ${env.dockerHubUser} -p ${env.dockerHubPass}"
                    sh "docker image tag easyshop:latest ${env.dockerHubUser}/easyshop:latest"
                    sh "docker push ${env.dockerHubUser}/easyshop:latest"
                }
            }
        }
        stage('Deploy'){
            steps{
                sh 'docker-compose down && docker-compose up -d'
            }
        }
    }
}
