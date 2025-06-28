# Micelleの概要
MicelleはAmazonRecognittionを利用した、画像判定機能のある清掃管理アプリです。  
部屋の写真と清掃タスクを登録し、任意のタイミングでAIによるフィードバックを得ることが出来ます。  
（コスト削減の為、画像診断機能はOFFにしています。利用されたい方は、製作者にご一報ください）。  

## インフラ図
![Micelle インフラ図](src/micelle.drawio.svg)
## ER図
![Micelle ER図](src/er.drawio.svg)

## 実装機能
・部屋の登録  
・タスクの登録  
・スケジュールを用いたタスクの自動更新  
・写真の更新  
・画像診断機能  

## 使用技術一覧
・バックエンド：Laravel 12.12.0, Laravel Breeze + Inertia  
・フロントエンド：React 8.3.1, Tailwind CSS 3.4.17 
・インフラ：Docker, GHCR, AWS EC2, ALB, S3, RDS(MySQL)  
・CI/CD：GitHub Actions及びGHCR（GitHub Container Registry）を利用したパイプライン  
・テスト：Cypressを用いたE2Eテスト、PHPのフィーチャーテスト及びESlintによるコードの品質管理  
・外部サービス：Amazon Rekognition API  
・その他：Git/GitHub フロー  

## アーキテクチャと設計方針
### フロント
・汎用性の高いUI及び規模の大きなUIをReactコンポーネント化  
・汎用性の高いロジック及び規模の大きなロジックをユーティリティ関数化  
・Inertiaを用いたSPA  
・TailwindCSSを用いたモダンなレスポンシブデザイン  

### バックエンド
・Laravel Breezeを用いたログイン認証機能  
・コントローラはデータのやり取りに注力し、ビジネスロジックはサービス層に委譲  
・バリデーションはリクエスト層へ委譲  

### インフラ・運用
・開発環境から本番環境までをDockerで一貫化  
・GHCRを用いたイメージ管理  
・GitHub Actionsを用いたCI/CDパイプライン  
・本番運用を意識したAWSリソースの利用  

## アピールポイント
・モダンなフレームワークを使用したアプリ構成（Laravel + React + TailwindCSS)  
・サービス/リクエスト層を利用した責任の分離  
・Inertiaを利用したSPA  
・Docker＋CI/CDによるテスト及びデプロイの自動化  
・本番運用を意識したAWSリソースの利用  
・Amazon Recognittionを利用した画像診断機能  
