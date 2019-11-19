# 修改1---根据实际项目 修改 REPO
REPO = http://gitlab.quvideo.com/WEB/url-service.git

S_OSTYPE := $$OSTYPE | grep -c 'darwin'
S_COPY = cp -r

TEST_FILE = *.test.js

# ------ 默认缺省值 可以不用修改，docker run 的时候 -e 传入
NODE_ENV = development
APL_URL=http://apollo-dev.xiaoying.co:8080
APL_CLUSTER=default
APL_APPID=base-common
# ------ 默认缺省值 可以不用修改，docker run 的时候 -e 传入

PROJ_TESTS = $(shell find test -type f -name "$(TEST_FILE)")
PROJ_DATE = $(shell date +%Y%m%d-%H%M%S)

# 以 docker 形式发布 k8s部署，一个 Pod 对应一个镜像，无需修改 port
PROJ_PORT = 80
PROJ_NGINX_PORT = 5051
PROJ_NANE = $(shell cat package.json | xargs -0 node -p 'JSON.parse(process.argv[1]).dockerName')
PROJ_VER = $(shell cat package.json | xargs -0 node -p 'JSON.parse(process.argv[1]).version')
PROJ_PATH = $(shell pwd)
# npx
PROJ_BIN = ./node_modules/.bin/

# 修改2---根据实际项目 修改 index.js src
LINT_DIR = app
BUILD_COPY = docker.pm2.yml Dockerfile package.json app doc public
BUILD_OUT = output/

# MACOS 默认 /private 目录是共享卷，另外请创建子目录： DockerDataShare
# Linux 请挂载到 /home 目录下，另外请创建子目录： DockerDataShare
# 简单判断（目前都是 MACOS开发 ，CentOS发布）
DOCKER_SHARE_ROOY_DIR = /private
ifeq ($(S_OSTYPE), Linux)
DOCKER_SHARE_ROOY_DIR = /home
endif
# 简单判断（目前都是 MACOS开发 ，CentOS发布）
DOCKER_SHARE_DATA = $(DOCKER_SHARE_ROOY_DIR)/DockerDataShare

CONF_REGISTRY_URL = http://registry.xnpm.quvideo.com
CONF_REGISTRY = --registry=$(CONF_REGISTRY_URL)

DOCKER_REPO = registry.cn-hangzhou.aliyuncs.com/vivavideo

ifeq ($(S_OSTYPE), 0)
S_COPY += L
endif


# declare -A map=(["development"]="vcm-dev" ["daily"]="vcm-qa" ["production"]="vcm")
ifeq ($(NODE_ENV), development)
	# 约定 dev 默认 config
	K8S_NAMEPACE_ENV=
	K8S_NAMEPACE=vcm-dev
	DOCKER_TAG = $(PROJ_VER)
  PROJ_NGINX_NAME = url-dev.xiaoying.tv
	IMAGE_POLICY = Always
else ifeq ($(NODE_ENV), daily)
	K8S_NAMEPACE_ENV=-qa
	K8S_NAMEPACE=vcm-qa
	DOCKER_TAG = $(PROJ_VER)
  # shorturl-daily.quvideo.com
  PROJ_NGINX_NAME = url-qa.xiaoying.tv
	IMAGE_POLICY = Always
else ifeq ($(NODE_ENV), production)
	K8S_NAMEPACE_ENV=-prod
	K8S_NAMEPACE=vcm-prod
	DOCKER_TAG = $(NODE_ENV)-$(PROJ_VER)-$(PROJ_DATE)
  PROJ_NGINX_NAME = url.xiaoying.tv
	IMAGE_POLICY = IfNotPresent
else
	K8S_NAMEPACE_ENV=-dev
	K8S_NAMEPACE=vcm-dev
	DOCKER_TAG = $(PROJ_VER)
  PROJ_NGINX_NAME = url-dev.xiaoying.tv
	# 适合本地 minikube
	imagePullPolicy = Never
endif

# npm ERR! code EINTEGRITY
# 初始化项目 16 机器已经安装 xnpm
init: clean
	@echo 'NPM install (dev) ...'
	@xnpm i $(CONF_REGISTRY)
	@echo 'NPM (dev) Done .'

# 检查js代码规范
eslint:
	@$(PROJ_BIN)eslint  $(LINT_DIR)/**/*.js
	@make gitcontributing > CONTRIBUTING.md
	@echo 'ESLint Done , Congratulations, you have no mistakes .'

# 格式化代码
pretty:
	@$(PROJ_BIN)prettier --single-quote --trailing-comma es5 --write $(LINT_DIR)/**/*.js 
	@$(PROJ_BIN)eslint --fix $(LINT_DIR)/**/*.js

# 启动 ENV
start:
	@NODE_ENV=$(NODE_ENV) $(PROJ_BIN)nodemon -w ./app/ -e .js -V

# 发布版本 开发时使用
release build: eslint pretty test-uni glab-build

# publish docker 镜像 (build，push镜像与清除无用镜像)
# 等待公司 docker 镜像仓库私有化
publish:
	@echo 当前环境变量是：$(NODE_ENV)；tag 是：$(DOCKER_TAG)
	@echo 请忽略以下错误，docker 发布开始，结束轻按 ctrl + c:
	@sleep 1
	@echo **请务必确认系统已经安装docker** ，开始登录阿里云私有仓库: 
	-docker login --username=junpeng.cheng@1914346484386584 -p a123456123 $(DOCKER_REPO)/
	@cd $(BUILD_OUT) && \
	docker build -t $(DOCKER_REPO)/$(PROJ_NANE):$(DOCKER_TAG) . && \
	docker push $(DOCKER_REPO)/$(PROJ_NANE):$(DOCKER_TAG)

# -docker images | grep none | awk '{print $3 }' | xargs docker rmi

# 部署
# 本地开发测试 运行
deploy:
	@echo 检查是否有同名容器存在，并结束
	-docker ps -a | grep "$(PROJ_NANE)" | awk '{print $$1 }' | xargs docker stop
	@sleep 0.2
	@echo 检查是否有同名容器存在，并移除
	-docker ps -a | grep "$(PROJ_NANE)" | awk '{print $$1 }' | xargs docker rm
	@sleep 0.2
	docker run -d -e NODE_ENV=$(NODE_ENV) -e APL_CLUSTER=$(APL_CLUSTER) -e APL_APPID=$(APL_APPID) -e APL_URL=$(APL_URL) --name $(PROJ_NANE) -p $(PROJ_NGINX_PORT):$(PROJ_PORT) $(DOCKER_REPO)/$(PROJ_NANE):$(DOCKER_TAG) 
	@echo 启动 $(PROJ_NANE) 镜像成功，请将容器端口: $(PROJ_NGINX_PORT) 代理到 nginx .



# ====== 修改默认 yml 配置文件 ========
APL_URL_RES = $(shell echo $(APL_URL) | sed 's/\/\//\\\/\\\//g')
K8S_FILE = k8s.yml

K8S_KUBECTL_CONF = $(shell cd $$HOME && pwd)/.kube/config$(K8S_NAMEPACE_ENV)
ifeq ($(S_OSTYPE), Linux)
K8S_KUBECTL_CONF = /root/.kube/config$(K8S_NAMEPACE_ENV)
endif
# ========= k8s 自动化 deploy 流程 start (不要在本地开发运行)=========
# =========（tpl 文件地址： doc/k8s.deployment.tpl.yml） =========
k8syml: 
	@echo 生成符合当前环境以及版本的 k8s 部署文件  $(K8S_FILE) ...
	@echo 环境（$(NODE_ENV)） 配置文件（vcm$(K8S_NAMEPACE_ENV)） 部署文件（$(K8S_KUBECTL_CONF)） 命名空间（$(K8S_NAMEPACE)）
	@$(S_COPY) doc/k8s.deployment.tpl.yml $(K8S_FILE)
	@sed -ig "s/{{DOCKER_NAME}}/$(PROJ_NANE)/" $(K8S_FILE)
	@sed -ig "s/{{DOCKER_TAG}}/$(DOCKER_TAG)/" $(K8S_FILE)
	@sed -ig "s/{{NODE_ENV}}/$(NODE_ENV)/" $(K8S_FILE)
	@sed -ig "s/{{APL_CLUSTER}}/$(APL_CLUSTER)/" $(K8S_FILE)
	@sed -ig "s/{{APL_APPID}}/$(APL_APPID)/" $(K8S_FILE)
	@sed -ig "s/{{APP_PORT}}/$(PROJ_PORT)/" $(K8S_FILE)
	@sed -ig "s/{{APP_HOSTNAME}}/$(PROJ_NGINX_NAME)/" $(K8S_FILE)
	@sed -ig "s/{{APL_URL}}/$(APL_URL_RES)/" $(K8S_FILE)
	@sed -ig "s/{{IMAGE_POLICY}}/$(IMAGE_POLICY)/" $(K8S_FILE)
	@-rm -rf $(K8S_FILE)g
	@echo k8s 部署文件 $(K8S_FILE) 生成完成 done 。
	
k8sdeploy: publish k8syml
	#@echo 执行命令是： kubectl --kubeconfig=$(K8S_KUBECTL_CONF) apply -f $(K8S_FILE) --record --namespace $(K8S_NAMEPACE)
	@kubectl --kubeconfig=$(K8S_KUBECTL_CONF) apply -f $(K8S_FILE) --record --namespace $(K8S_NAMEPACE)
	#@echo 执行命令是： kubectl --kubeconfig=$(K8S_KUBECTL_CONF) rollout status deployment/$(PROJ_NANE) --namespace $(K8S_NAMEPACE)
	@kubectl --kubeconfig=$(K8S_KUBECTL_CONF) rollout status deployment/$(PROJ_NANE) --namespace $(K8S_NAMEPACE)
	@echo k8s部署执行结束 done 。

# ========= k8s 自动化 deploy 流程 end =========

# 生产环境
production:
	@npm i --production $(CONF_REGISTRY)

# 生成 changelog -w -r 0
changelog:
	@$(PROJ_BIN)conventional-changelog -p angular -i CHANGELOG.md -s 

# 测试  make test-uni TEST_FILE=my-test-fun.js
test-uni:
	NODE_ENV=$(NODE_ENV) $(PROJ_BIN)mocha -R spec -t 60000 --exit -r ./test/index.js $(PROJ_TESTS);

# 代码覆盖情况
test-cov:
	NODE_ENV=$(NODE_ENV) $(PROJ_BIN)nyc --reporter=lcov --reporter=text-summary $(PROJ_BIN)mocha -R list -t 60000 --exit -r ./test/index.js $(PROJ_TESTS);

# 清除项目多余文件
clean:
	@echo '开始清理多余文件，结束请按 ctrl + c ...'
	@sleep 1
	@rm -rf $(BUILD_OUT) node_modules logs coverage 
	@echo 'Done .'

clean-r:
	@echo '开始清理多余文件，结束请按 ctrl + c ...'
	@sleep 0.5
	-rm -rf $(BUILD_OUT) 

# 用于 gitlab-cli build 不要在开发阶段使用
glab-build: clean-r
	@echo "开始打包项目，停止请按 ctrl + c ..."
	@sleep 0.5
	@mkdir -p $(BUILD_OUT)
	@$(S_COPY) $(BUILD_COPY) $(BUILD_OUT)
	@echo "正在安装生产环境的npm包 ..."
	@cd $(BUILD_OUT) &&xnpm i --production $(CONF_REGISTRY)
	@echo "完成，请检查打包输出的目录 : \"$(BUILD_OUT)\""

# 初始化 git 
gitinit:
	@echo '确保你的项目是第一次初始化 git ...'
	-rm -rf .git/
	@git init
	-git remote rm origin
	@git remote add origin $(REPO)
	@echo 'Done .'

gitcontributing:
	@echo "具体贡献指南请参考 [README.md](./README.md#本地常规开始) \n 以下是贡献者统计:"
	@git log --format='%aN' | sort -u | while read name; do echo "\n### $$name\t"; git log --author="$$name" --pretty=tformat: --numstat | awk '{ add += $$1; subs += $$2; loc += $$1 - $$2 } END { printf "添加代码: *%s* 行, 删除代码: ~~%s~~ 行, 总共贡献: __%s__ 行;\n", add, subs, loc }' -; done
	@echo "\n----\ncontributing done ".

# 查看git提交日志
gitlog:
	@git log --pretty=format:"%h - %an, %ar : %s" --graph

.PHONY: clean start lint publish deploy publish
