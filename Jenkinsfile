@Library('shared') _

pipeline{
    
    agent any
    stages{
        stage("Code Clone"){
            steps{
                script{
                    clone('https://github.com/anurag1352/tws-e-commerce-app.git', 'master')
                }
            }
        }
        stage("Build Image"){
            steps{
                script{
                    build('e-commerce-app','latest', 'anurag904')
                }
            }
        }
        stage("Testing"){
            steps{
                echo "Testing Start.."
                echo "testing Done..."
            }
        }
        stage("Image & file Scan"){
            steps{
                script{
                    trivy_scan()
                }
            }
        }
        stage("Push To DockerHub"){
            steps{
                script{
                    docker_push("e-commerce-app", "latest", "anurag904")
                }
            }
        }
        stage("Deploy"){
            steps{
                echo "Deployment Start.."
                sh "docker-compose down && docker-compose up -d"
                echo "Deployement Done.."
            }
        }
    }
}
