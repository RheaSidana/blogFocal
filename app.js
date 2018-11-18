var app = angular.module('myApp', ['ui.router', ' ngToast',  'textangular']);
app.config( function (){
    Stamplay.init("a5d8ej");
});

app.run (function ($rootScope, AuthService, $state){
    $rootScope.$on('$stateChangeState', function(event , toState, toParams, fromParams){
        if(toState.authenticate == true){
            AuthService.isAuthenticated()
            .then (function(res)
            {
                if (res== false)
                {
                    $state.go ('login');
                }
            });
        }
    });
});

app.config(function($stateProvider,$urlRouterProvider){
    $stateProvider
    .state('home',{
        url:'/',
        templateurl:'templates/home.html',
        controller:'HomeCtrl'
    })
    .state('MyBlogs',{
        url:'/MyBlogs',
        templateurl:'templates/myblog.html',
        controller:'MyBlogsCtrl',
        authenticate: true 
    })
    .state('Login',{
        url:'/login',
        templateurl:'templates/login.html',
        controller:'LoginCtrl'
    })
    .state('SignUp',{
        url:'/SignUp',
        templateurl:'templates/signup.html',
        controller:'SignUpCtrl'
    })
    .state('Create',{
        url:'/create',
        templateurl:'templates/create.html',
        controller:'CreateCtrl',
        authenticate: true 
    })
    .state('Edit',{
        url:'/edit',
        templateurl:'templates/edit.html',
        controller:'EditCtrl',
        authenticate: true 
    })
    .state('view',{
        url:'/View',
        templateurl:'templates/view.html',
        controller:'ViewCtrl'
    })
    .state('saved',{
        url:'/saved',
        templateurl:'templates/saved.html',
        controller:'SavedCtrl',
        authenticate: true 
    })
    .state('surfBlogs',{
        url:'/surfBlogs',
        templateurl:'templates/latestpost.html',
        controller:'SurfBlogsCtrl',
        authenticate: true 
    })
    .state('deleteBlogs',{
        url:'/delete',
        templateurl:'templates/Delete.html',
        controller:'DeleteCtrl',
        authenticate: true 
    })
    .state('deleteSavedBlogs',{
        url:'/deleteSaved',
        templateurl:'templates/Delete.html',
        controller:'DeleteSavedCtrl',
        authenticate: true 
    });
    $urlRouterProvider.otherwise("/");
});

app.filter('htmlToPlainText', function(){
    return function (text){
        return text ? String(text) . replace (/[^>]+/gm ,'') : '' ;
    }
});

app.factory('Authservice', function($q, $rootScope ){
    return {
        isauthenticated:function(){
            var defer = $q.defer();
            Stamplay.USer.currentUser( function (err, res){
                if(err){
                    defer.resolve (false);
                    $rootScope.LoggedIn= false;
                }
                if(res.user){
                    defer.resolve(true);
                    $rootScope.LoogedIn = true;
                }
                else{
                    defer.resolve(false);
                    $rootScope.LoggedIn = false;
                }
            });
            return defer.promise;
        }
    }
});

app.controller('HomeCtrl', function ($rootScope, $timeout, $state){
    $scope.logout=function(){
        console.log ("logoutcalled");
        
    }
});

app.controller('DeleteCtrl', function ($rootScope, $timeout, $state){
    $scope.delete=function(){
        Stamplay.USer.currentUser()
        .then(function(r){
            if (r.user)
            {
                Stamplay.Object("blogs").remove($scope.newPost)
                .then(function(res){
                    console.log(res);
                    $scope.$apply();
                    $timeout(function(){
                        ngToast("Post Deleted");
                    });
                },
                function(err)
                {
                    console.log(err);
                    $timeout(function(){
                        ngToast.create("error occured");
                    });
                });
            }
            else{
                state.go('login');
            }
        },
        function(er){
            $timeout(function(){
                ngToast.create("error occured");
            });
            console.log(er);
        });
    };
});

app.controller('SavedCtrl', function($scope, $state){
    Stamplay.User.currentUser(function(res){
        if(res.user){
            Stamplay.Object("blogs").get({owner: res.user._id,  sort:"-dt_create"      })
            .then(function(res){
                console.log(res);
                $scope.SavedPost=res.data;
                $scope.$apply();
                console.log($scope.userBlog);
            }, 
            function(err){
                console.log(err);
            });
        }
        else {
            $state.go('login');
        }
    },
    function(err){
        console.log(err);
    });
});

app.controller('SurfBlogsCtrl', function($scope,$http){
    Stamplay.Object ("blogs").get({sort:"-dt_create"})
    .then(function(res){
        console.log(res);
        $scope.latestBlogs = res.data;
        $scope.$apply();
        console.log($scope.latestBlogs);
    },
    function (err){
        console.log(err);
    });
});

app.controller('ViewCtrl', function ($scope, $state, $timeout, $stateParams,ngToast){
    $scope.upVoteCount = 0;
    $scope.downVoteCount = 0;
    $scope.savedcount=0;
    $scope.flagCount=0;

    Stamplay.Object("blogs").get ({_id: $stateParams.id })
    .then(function(resp){
        $scope.blog=resp.data[0];
        $scope.upVoteCount = $scope.blog.actions.votes.users_upVote.length;
        $scope.downVoteCount = $scope.blog.actions.votes.users_downVote.length;
        $scope.savedCount= $scope.blog.actions.votes.users_SavePost.length;
        $scope.flagCount= $scope.blog.actions.votes.users_flag.length;
        $scope.shareCount=$scope.blog.actions.votes.users_shared.length;
        $scope.$apply();
        ngToast.create("View the blogs");
    },
    function(err){
        console.log(err);
        ngToast.create("An error occured! Please try again later or login again");
    });
    $scope.upVote = function(){
        Stamplay.Object("blogs").upVote($stateParams.id)
        ,then(function(respose){
            console.log(response);
            $scope.log= response;
            $scope.comment="";
            $scope.upVoteCount= $scope.blog.actions.votes.users_upVote.length;
            $scope.$apply();
        },
        function(err){
            console.log(err);
            if(err.code==403){
                console.log("login first");
                $timeout(function(){
                    ngToast.craete('<a href="#/login" class="">Please loggin first before voting</a>');
                });
            }
            if (err.code == 406){
                console.log("already voted");
                $timeout(function(){
                    ngToast.create("You have already voted on this blog post!");
                });
            }
        });
    }
    $scope.downVote = function(){
        Stamplay.Object("blogs").downVote($stateParams.id)
        .then(function(respose){
            console.log(response);
            $scope.log= response;
            $scope.comment="";
            $scope.downVoteCount= $scope.blog.actions.votes.users_downVote.length;
            $scope.$apply();
        },
        function(err){
            console.log(err);
            if(err.code==403){
                console.log("login first");
                $timeout(function(){
                    ngToast.craete('<a href="#/login" class="">Please loggin first before voting</a>');
                });
            }
            if (err.code == 406){
                console.log("already voted");
                $timeout(function(){
                    ngToast.create("You have already voted on this blog post!");
                });
            }
        });
    }

    $scope.SavedPost = {};
    $scope.SavePost = function(){
        Stamplay.User.currentUser()
        .then(function(res){
            if(res.user){
                Stamplay.Object("blogs").save($scope.savedPost)
                .then(function (res){
                    $timeout(function(){
                    ngToast.craete("Post Successful");
                    });
                    $scope.savedCount= $scope.blog.actions.votes.users_SavedPost.length;
                    $state.go("saved");
                },
                function(err){
                    $timeout(function(){
                        ngToast.create("error occured");
                    });
                    console.log(err);
                })
            }
            else {
                $state.go("login");
            }
        }, 
        function (err){
            $timeout(function(){
                ngToast.create("An error occured");
            });
            console.log(err);
        })
    }

    $scope.flagsAdd=function(){
        Stamplay.Object("blogs").flagAdd($stateParams.id)
        .then(function(res){
            console.log(res);
            $scope.blog=res.data;
            $scope.comment=" ";
            $scope.flagCount = $scope.blog.actions.votes.users_flag.length;
            $scope.$apply();

            if ($scope.flagCount == 5)
            {
                Stamplay.Object("blogs").reove($scope.Post)
                .then(function(res){
                    console.log(res);
                    $scope.$apply();
                });
            }
        },
        function(err){
            console.log(err);
            if(err.code==403){
                console.log("login first");
                $timeout(function(){
                    ngToast.craete('<a href="#/login" class="">Please loggin first before voting</a>');
                });
            }
            if (err.code == 406){
                console.log("already voted");
                $timeout(function(){
                    ngToast.create("You have already voted on this blog post!");
                });
            }
        });
    }
    $scope.postcomment = function(){
        Stamplay.Object("blogs").comment($stateParams.id, $scope.comment)
        .then(function(resp){
            console.log(resp);
            $scope.blog = resp;
            $scope.comment=" ";
            $scope.$apply();
        },
        function(err){
            console.log(err);
            if(err.code == 403){
                console.log("login First!");
                $timeout(function(){
                    ngToast.create('<a href = "#/login" class=" "> Please login before posting comments!.</a>');
                });
            }
        })
    }
});

app.controller ('LoginCtrl', function($scope, $location, $timeout,$rootScope,ngToast){
    $scope.login = function(){
        Stamplay.User.currentUser()
        .then(function(res){
            console.log(res);
            if (res.User){
                $rootScope.LoggedIn = true;
                $rootScope.displayName = res.User.fName+ " " + rs.USer.lName;
                $timeout (function(){
                    $location.path("/viewBlogs");
                    ngToast.create("user can now view the blogs");
                });
            }
            else{
                Stamplay.User.login($scope.user)
                .then(function(res)
                {
                    console.log(res);
                    $rootScope.LoggedIn=true;
                    $rootScope.displayName=res.fName + " "+ res.lname;
                    $timeout(function(){
                        $state.go("MyBlogs");
                        ngToast.create("user can now view his/her blogs")
                    });
                },
                function (error){
                    console.log(error);
                    $rootScope.LoggedIn = false;
                    $timeout(function(){
                        ngToast("error has occured");
                    });
                });
            }
        });
    };
});

app.controller('MyBlogsCtrl', function($scope, $state){
    $scope.ViewsCount=0;

    Stamplay.User.currentUser(function(res){
        if(res.user){
            Stamplay.Object("blogs").get({owner: res.user._id,  sort:"-dt_create"      })
            .then(function(res){
                console.log(res);
                $scope.userBlogs=res.data;
                $scope.$apply();
                console.log($scope.userBlog);
            }, 
            function(err){
                console.log(err);
            });
        }
        else {
            $state.go('login');
        }
    },
    function(err){
        console.log(err);
    });

    $scope.viewing() = function(){
        Stamplay.Object ("blogs"). view($stateParams.id)
        .then(function(res){
            console.log(res);
            //$scope.blog=res;
            //$scope.comment=" ";
            $scope.ViewsCount=$scope.blog.action.votes.users_view.length;
            $scope.$apply();
        },
        function(err){
            console.log(err);
            if(err.code==403){
                console.log("login first");
                $timeout(function(){
                    ngToast.craete('<a href="#/login" class="">Please loggin first before voting</a>');
                });
            };
        });
    };
});

app.controller('SignUpCtrl', function($scope){
    $rootscope.newUser={};
    $rootScope.SignUp=function(){
        if($rootScope.newUser.fName && $rootScope.newUser.lName && $rootScope.newUser.email && $rootScope.newUser.password && $rootScope.newUser.confirmPassword )
        {
            console.log(" All fields are valid !! ");
            if ($rootScope.newUSer.password == $rootScope.newUSer.confirmPassword)
            {
                console.log(" All Good!!!!  Lets Sing Up !! ");
                ngToast.create("All good. Lets continue");
            }
            else{
                console.log("Password donot match");
                ngToast.create("Password do not match,  please enter the correct Password ");
            }
        }
        else{
            console.log("Fields invalid");
                ngToast.create(" Some fields are invalid or missing. Please enter a valid fields! ");
        }
        $timeout( function (){
            $state.go("Page1");
        });

    };
    $scope.newUser.displayName= $scope.newUser.fname + " " + $scope.newUser.lname;

    Stamplay.User.currentUser(function(res){
        if(res.user){
            Stamplay.Object("Blogs").get({owner: res.user._id,  sort:"-dt_create"   })
            .then(function(res){
                console.log(res);
                $scope.userBlogs=res.data;
                $scope.$apply();
                console.log($scope.userBlog);
            }, 
            function(err){
                console.log(err);
            });
        }
        else {
            $state.go('login');
        }
    },
    function(err){
        console.log(err);
    });
});

app.controller('EditCtrl', function(taOption, $state,$scope, $timeout, $ngToast, $stateParams){
    $scope.Post = {};
    taOption.toolbar = [
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p','pre', 'quote'],
        ['bold', 'italics', 'underline', 'ul', 'ol', 'redo', 'undo', 'clear'],
		['justifyLeft','justifyCenter','justifyRight', 'justifyFull'],
		['html', 'insertImage', 'insertLink', 'wordcount', 'charcount']
    ];

    Stamplay.Object("blogs").get({_id: $stateParams.id})
    .then(function(res){
        console.log(res);
        $scope.Post = res.data[0];
        $scope.apply();
        console.log($scope.Post);
    },
    function (err){
        console.log(err);
    });

    $scope.update = function(){
        Stamplay.User.currentUser()
        .then(function(res){
            if(res.User){
                if(res.user.id == $scope.Post.owner){
                    Stamplay.Object("blogs").update($stateParams.id, $scope.Post)
                    .then (function(resp){
                        console.log(resp);
                        state.go("MyBlogs");
                    },
                    function (err){
                        console.log(er);
                    });
                }
                else {
                    $state.go("login");
                }
            }
        },
        function(error){
                console.log(error);
        });
    };

});

app.controller('CreateCtrl', function(taOption, $state,$scope, $timeout, $ngToast, $stateParams){
    taOption.toolbar = [
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p','pre', 'quote'],
        ['bold', 'italics', 'underline', 'ul', 'ol', 'redo', 'undo', 'clear'],
		['justifyLeft','justifyCenter','justifyRight', 'justifyFull'],
		['html', 'insertImage', 'insertLink', 'wordcount', 'charcount']
    ];

    $scope.newPost={};
    $scope.create= function(){
        Stamplay.User.currentUser()
        .then(function(res){
            if(res.user){
                Stamplay.Object("blogs").save($scope.newPost)
                .then(function (res){
                    ngToast.craete("Post Successful");
                    $state.go("MyBlogs");
                },
                function(err){
                    $timeout(function(){
                        ngToast.create("error occured");
                    });
                    console.log(err);
                })
            }
            else {
                $state.go("login");
            }
        }, 
        function (err){
            $timeout(function(){
                ngToast.create("An error occured");
            });
            console.log(err);
        })
    }
});

app.controller('deleltSavedCtrl', function ($rootScope, $timeout, $state){
    $scope.deletesaved=function(){
        Stamplay.User.currentUser()
        .then(function(res){
            if(res.user){
                Stamplay.Object("blogs").remove($scope.SavedPost)
                .then(function(r){
                    $timeout(function(){
                        ngToast.create("Post Deleted");
                    });
                    $state.go("savedBlogs");
                },
                function(er){
                    $timeout(function(){
                        ngToast.create("Error Occured");
                    });
                    console.log(er);
                });
            }
            else{
                $state.go("login");
            }
        },
        function(error){
            $timeout(function(){
                ngToast.create("Error Occured");
            });
            console.log(error);
        })        
    }
});