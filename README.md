[![Live Demo](https://img.shields.io/badge/demo-online-green)](https://micelle-portfolio.com/)
[![CI](https://github.com/141Takahiro/micelle/actions/workflows/CICD.yml/badge.svg)](https://github.com/141Takahiro/micelle/actions/workflows/CICD.yml)

# Micelle
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
・バックエンド：PHP 8.3, Laravel 12.12, Laravel Breeze + Inertia  
・フロントエンド：React 8.3, Tailwind CSS 3.4  
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

## 動作確認
### 1. リポジトリをクローン
```bash
git clone https://github.com/141Takahiro/micelle.git  
cd micelle
```
### 2. 環境変数ファイルを用意
```bash
cp src/.env.example src/.env
```
### 3. dockerコンテナを起動（開発用）
```bash
docker-compose up -d --build
```
### 4. フロントエンドの開発用サーバーを起動
```bash
cd src  
npm ci  
npm run dev
```
### 5. 注意点
・環境変数はサンプルのコピーで立ち上がりますが、必要ならデータベースをMySQLに修正してください。  
・AWS及びCypressの実行には、別途キーが必要です。  
・docker-compose.testはCI/CD上でのテストに、prodは本番環境に使用します。  

## アピールポイント
・モダンなフレームワークを使用したアプリ構成（Laravel + React)  
・TailwindCSSを利用したレスポンシブデザイン
・サービス/リクエスト層を利用した責任の分離  
・Inertiaを利用したSPA  
・Docker＋CI/CDによるテスト及びデプロイの自動化  
・本番運用を意識したAWSリソースの利用  
・Amazon Recognittionを利用した画像診断機能  

## 参考書籍
・Webデザインの新しい教科書  
・いちばんやさしいJavaScriptの教本  
・Laravel入門  
・情報セキュリティ超入門  
・SQL ゼロからはじめるデータベース操作  
・UXデザインの法則  
・リーダブルコード  
・React 実践の教科書  
・新しいLinuxの教科書  
・初めてのPHP  
・AWSの基本・仕組み・重要用語の全部わかる教科書  
・Docker絵とき入門  
・Laravelの教科書  
・UIデザイン必携  
・Laravel実践開発  
・いちばんやさしいGit&GitHubの教本  
・GitHub CI/CD実践ガイド
