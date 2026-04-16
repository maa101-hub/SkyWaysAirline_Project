package com.mphasis.skywaysairline.userservice.aspect;

import java.util.Arrays;

import jakarta.servlet.http.HttpServletRequest;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {

    private static final Logger log =
            LoggerFactory.getLogger(LoggingAspect.class);

    @Autowired
    private HttpServletRequest request;

    // =====================================
    // CONTROLLER LOGGING
    // =====================================
    @Around(
        "execution(* com.mphasis.skywaysairline.userservice.controller..*(..))"
    )
    public Object logController(
            ProceedingJoinPoint joinPoint) throws Throwable {

        long start =
                System.currentTimeMillis();

        String method =
                joinPoint.getSignature()
                        .toShortString();

        String uri =
                request.getRequestURI();

        String httpMethod =
                request.getMethod();

        String user =
                getLoggedInUser();

        log.info("=================================================");
        log.info("API Request Started");
        log.info("User        : {}", user);
        log.info("HTTP Method : {}", httpMethod);
        log.info("URL         : {}", uri);
        log.info("Controller  : {}", method);
        log.info(
                "Arguments   : {}",
                Arrays.toString(
                        joinPoint.getArgs()
                )
        );

        Object result =
                joinPoint.proceed();

        long time =
                System.currentTimeMillis() - start;

        log.info("API Request Completed");
        log.info("Execution Time : {} ms", time);
        log.info("=================================================");

        return result;
    }

    // =====================================
    // SERVICE LOGGING
    // =====================================
    @Around(
        "execution(* com.mphasis.skywaysairline.userservice.service..*(..))"
    )
    public Object logService(
            ProceedingJoinPoint joinPoint) throws Throwable {

        long start =
                System.currentTimeMillis();

        String method =
                joinPoint.getSignature()
                        .toShortString();

        log.info(
                "Service Started : {}",
                method
        );

        Object result =
                joinPoint.proceed();

        long time =
                System.currentTimeMillis() - start;

        log.info(
                "Service Completed : {}",
                method
        );

        log.info(
                "Service Time      : {} ms",
                time
        );

        return result;
    }

    // =====================================
    // REPOSITORY LOGGING
    // =====================================
    @Around(
        "execution(* com.mphasis.skywaysairline.userservice.repo..*(..))"
    )
    public Object logRepository(
            ProceedingJoinPoint joinPoint) throws Throwable {

        long start =
                System.currentTimeMillis();

        String method =
                joinPoint.getSignature()
                        .toShortString();

        log.debug(
                "Repository Started : {}",
                method
        );

        Object result =
                joinPoint.proceed();

        long time =
                System.currentTimeMillis() - start;

        log.debug(
                "Repository Completed : {}",
                method
        );

        log.debug(
                "Repository Time      : {} ms",
                time
        );

        return result;
    }

    // =====================================
    // EXCEPTION LOGGING
    // ONLY CONTROLLER + SERVICE + REPO
    // =====================================
    @AfterThrowing(
        pointcut =
            "execution(* com.mphasis.skywaysairline.userservice.controller..*(..)) || " +
            "execution(* com.mphasis.skywaysairline.userservice.service..*(..)) || " +
            "execution(* com.mphasis.skywaysairline.userservice.repo..*(..))",
        throwing = "ex"
    )
    public void logException(
            JoinPoint joinPoint,
            Exception ex) {

        log.error(
                "************** EXCEPTION OCCURRED **************"
        );

        log.error(
                "Class   : {}",
                joinPoint.getTarget()
                        .getClass()
                        .getSimpleName()
        );

        log.error(
                "Method  : {}",
                joinPoint.getSignature()
                        .getName()
        );

        log.error(
                "Message : {}",
                ex.getMessage(),
                ex
        );

        log.error(
                "***********************************************"
        );
    }

    // =====================================
    // USER FETCH
    // =====================================
    private String getLoggedInUser() {

        try {

            Authentication auth =
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication();

            if (auth != null &&
                    auth.isAuthenticated()) {

                return auth.getName();
            }

        } catch (Exception e) {

            return "Anonymous";
        }

        return "Anonymous";
    }
}