  (func (;41042;) (type 9) (param i32 i32 i32 i32 i32) (result i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i64)
    global.get 0
    i32.const 128
    i32.sub
    local.tee 4
    global.set 0
    i32.const 4365140
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3356428
      call 2180
      i32.const 3375628
      call 2180
      i32.const 3377868
      call 2180
      i32.const 3375596
      call 2180
      i32.const 3376296
      call 2180
      i32.const 3377872
      call 2180
      i32.const 3357332
      call 2180
      i32.const 3357344
      call 2180
      i32.const 3408164
      call 2180
      i32.const 3359088
      call 2180
      i32.const 3359256
      call 2180
      i32.const 3413540
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3362128
      call 2180
      i32.const 3415768
      call 2180
      i32.const 3420152
      call 2180
      i32.const 3420168
      call 2180
      i32.const 3482380
      call 2180
      i32.const 3446000
      call 2180
      i32.const 3445996
      call 2180
      i32.const 3482644
      call 2180
      i32.const 3446008
      call 2180
      i32.const 4365140
      i32.const 1
      i32.store8
    end
    local.get 4
    i32.const 0
    i32.store offset=120
    local.get 4
    i32.const 0
    i32.store offset=116
    local.get 4
    i32.const 0
    i32.store offset=112
    local.get 4
    i64.const 0
    i64.store offset=104
    local.get 0
    i32.load offset=44
    local.set 5
    i32.const 3360788
    i32.load
    local.tee 6
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 6
      call 60460
    end
    block  ;; label = @1
      local.get 5
      i32.const 0
      i32.const 0
      call 48872
      if  ;; label = @2
        i32.const 3356428
        i32.load
        local.tee 1
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 1
          call 60460
        end
        i32.const 0
        local.set 5
        i32.const 3446000
        i32.load
        i32.const 0
        call 55817
        br 1 (;@1;)
      end
      i32.const 3357344
      i32.load
      local.tee 5
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 5
        call 60460
      end
      i32.const 4367474
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3357344
        call 2180
        i32.const 4367474
        i32.const 1
        i32.store8
      end
      i32.const 3357344
      i32.load
      local.tee 6
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 6
        call 60460
        i32.const 3357344
        i32.load
        local.set 6
      end
      i32.const 0
      local.set 5
      i32.const 3375628
      i32.load
      local.set 10
      local.get 6
      i32.load offset=92
      i32.load
      i32.load offset=20
      local.set 6
      local.get 4
      local.get 1
      i32.load offset=16
      i32.store offset=80
      local.get 6
      local.get 4
      i32.const 80
      i32.add
      local.get 4
      i32.const 120
      i32.add
      local.get 10
      call 34286
      i32.eqz
      br_if 0 (;@1;)
      i32.const 3357344
      i32.load
      local.tee 5
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 5
        call 60460
      end
      i32.const 4367474
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3357344
        call 2180
        i32.const 4367474
        i32.const 1
        i32.store8
      end
      i32.const 3357344
      i32.load
      local.tee 5
      i32.load offset=116
      if (result i32)  ;; label = @2
        local.get 5
      else
        local.get 5
        call 60460
        i32.const 3357344
        i32.load
      end
      i32.load offset=92
      i32.load
      i32.load offset=24
      local.set 10
      i32.const 3359256
      i32.load
      local.tee 5
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 5
        call 60460
        i32.const 3359256
        i32.load
        local.set 5
      end
      i32.const 3376296
      i32.load
      local.set 6
      local.get 5
      i32.load offset=92
      i32.load
      local.set 5
      local.get 4
      local.get 1
      i32.load offset=8
      i32.store offset=80
      local.get 5
      local.get 4
      i32.const 80
      i32.add
      local.get 4
      i32.const 124
      i32.add
      local.get 6
      call 34434
      local.get 4
      i32.load offset=124
      local.set 8
      local.get 4
      i32.load offset=120
      i32.const 0
      call 48864
      local.set 5
      i32.const 3362128
      i32.load
      local.tee 6
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 6
        call 60460
      end
      block  ;; label = @2
        i32.const 0
        call 43634
        i32.load offset=48
        local.get 1
        i32.load offset=32
        local.get 4
        i32.const 116
        i32.add
        i32.const 3377868
        i32.load
        call 34286
        if  ;; label = @3
          local.get 4
          i32.load offset=116
          local.set 6
          i32.const 3360788
          i32.load
          local.tee 7
          i32.load offset=116
          i32.eqz
          if  ;; label = @4
            local.get 7
            call 60460
          end
          local.get 6
          i32.const 0
          i32.const 0
          call 48872
          i32.eqz
          br_if 1 (;@2;)
        end
        local.get 4
        i32.const 0
        call 56067
        i32.load offset=256
        local.get 1
        i32.load offset=32
        i32.const 0
        call 48049
        i32.const 3415768
        i32.load
        call 24700
        local.tee 6
        i32.store offset=116
        i32.const 3360788
        i32.load
        local.tee 7
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 7
          call 60460
        end
        local.get 6
        i32.const 0
        i32.const 0
        call 48872
        if  ;; label = @3
          i32.const 0
          local.set 5
          i32.const 3482380
          i32.load
          local.get 1
          i32.load offset=32
          i32.const 3482644
          i32.load
          i32.const 0
          call 48222
          local.set 1
          i32.const 3356428
          i32.load
          local.tee 0
          i32.load offset=116
          i32.eqz
          if  ;; label = @4
            local.get 0
            call 60460
          end
          local.get 1
          i32.const 0
          call 55817
          br 2 (;@1;)
        end
        i32.const 3362128
        i32.load
        local.tee 6
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 6
          call 60460
        end
        i32.const 0
        call 43634
        i32.load offset=48
        local.get 1
        i32.load offset=32
        local.get 4
        i32.load offset=116
        i32.const 3377872
        i32.load
        call 34436
      end
      local.get 0
      i32.load offset=44
      local.set 6
      local.get 4
      i32.load offset=116
      local.set 7
      i32.const 3360788
      i32.load
      local.tee 9
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 9
        call 60460
      end
      local.get 7
      local.get 6
      i32.const 3413540
      i32.load
      call 24532
      local.tee 6
      local.get 4
      i32.const 80
      i32.add
      i32.const 3408164
      i32.load
      call 45354
      local.get 4
      i32.load offset=80
      local.tee 7
      i32.const 0
      i32.const 0
      call 48872
      if  ;; label = @2
        i32.const 3356428
        i32.load
        local.tee 1
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 1
          call 60460
        end
        i32.const 3445996
        i32.load
        i32.const 0
        call 55817
        i32.const 3360788
        i32.load
        local.tee 1
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 1
          call 60460
        end
        i32.const 0
        local.set 5
        local.get 6
        i32.const 0
        call 48975
        br 1 (;@1;)
      end
      local.get 8
      i32.load offset=32
      local.set 8
      i32.const -3
      i32.const 3
      i32.const 0
      call 48614
      local.set 9
      local.get 4
      local.get 1
      i32.load offset=8
      i32.store offset=100
      i32.const 3359088
      i32.load
      local.get 4
      i32.const 100
      i32.add
      call 2193
      local.set 11
      local.get 4
      local.get 1
      i32.load offset=16
      i32.store offset=96
      i32.const 3357332
      i32.load
      local.get 4
      i32.const 96
      i32.add
      call 2193
      local.set 12
      local.get 4
      local.get 8
      local.get 9
      i32.add
      local.tee 8
      i32.store offset=92
      i32.const 3359088
      i32.load
      local.get 4
      i32.const 92
      i32.add
      call 2193
      local.set 9
      local.get 6
      i32.const 3446008
      i32.load
      local.get 11
      local.get 12
      local.get 9
      i32.const 0
      call 48228
      i32.const 0
      call 48960
      local.get 6
      local.get 5
      i32.const 0
      call 48830
      local.get 4
      i32.const 80
      i32.add
      local.get 0
      local.get 4
      local.get 4
      call 41043
      local.get 4
      i64.load offset=80
      local.set 13
      i32.const 3375596
      i32.load
      local.set 0
      local.get 4
      local.get 1
      i32.load offset=16
      i32.store offset=80
      local.get 10
      local.get 4
      i32.const 80
      i32.add
      local.get 4
      i32.const 124
      i32.add
      local.get 0
      call 34434
      local.get 4
      local.get 13
      i64.store offset=72
      local.get 4
      local.get 13
      i64.store offset=48
      local.get 7
      local.get 1
      local.get 4
      i32.load offset=124
      local.get 8
      i32.add
      local.get 8
      local.get 4
      i32.const 48
      i32.add
      local.get 5
      local.get 2
      i32.const 0
      call 44352
      local.get 4
      i32.const 104
      i32.add
      local.get 6
      i32.const 0
      call 48828
      i32.const 0
      call 49493
      local.get 1
      i32.load offset=16
      local.set 1
      local.get 6
      i32.const 0
      call 48828
      local.set 5
      local.get 1
      i32.const 3
      i32.ne
      i32.const 0
      local.get 3
      select
      i32.eqz
      if  ;; label = @2
        local.get 4
        local.get 4
        i32.load offset=112
        i32.store offset=40
        local.get 4
        local.get 4
        i64.load offset=104
        i64.store offset=32
        local.get 5
        local.get 4
        i32.const 32
        i32.add
        i32.const 0
        call 49495
        i32.const 3357344
        i32.load
        local.tee 1
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 1
          call 60460
        end
        i32.const 4367474
        i32.load8_u
        i32.eqz
        if  ;; label = @3
          i32.const 3357344
          call 2180
          i32.const 4367474
          i32.const 1
          i32.store8
        end
        i32.const 3357344
        i32.load
        local.tee 1
        i32.load offset=116
        if (result i32)  ;; label = @3
          local.get 1
        else
          local.get 1
          call 60460
          i32.const 3357344
          i32.load
        end
        i32.load offset=92
        i32.load
        local.set 1
        i32.const 3360788
        i32.load
        local.tee 5
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 5
          call 60460
        end
        local.get 1
        i32.const 0
        i32.const 0
        call 48812
        if  ;; label = @3
          i32.const 3357344
          i32.load
          local.tee 1
          i32.load offset=116
          i32.eqz
          if  ;; label = @4
            local.get 1
            call 60460
          end
          i32.const 4367474
          i32.load8_u
          i32.eqz
          if  ;; label = @4
            i32.const 3357344
            call 2180
            i32.const 4367474
            i32.const 1
            i32.store8
          end
          i32.const 3357344
          i32.load
          local.tee 1
          i32.load offset=116
          if (result i32)  ;; label = @4
            local.get 1
          else
            local.get 1
            call 60460
            i32.const 3357344
            i32.load
          end
          i32.load offset=92
          i32.load
          local.get 7
          i32.const 0
          call 44368
          i32.const 1
          local.set 5
          br 2 (;@1;)
        end
        i32.const 4367479
        i32.load8_u
        i32.eqz
        if  ;; label = @3
          i32.const 3357352
          call 2180
          i32.const 4367479
          i32.const 1
          i32.store8
        end
        i32.const 1
        local.set 5
        i32.const 3357352
        i32.load
        i32.load offset=92
        i32.load
        local.tee 1
        i32.eqz
        br_if 1 (;@1;)
        local.get 1
        local.get 7
        local.get 4
        call 40968
        br 1 (;@1;)
      end
      i32.const 4377527
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3364792
        call 2180
        i32.const 4377527
        i32.const 1
        i32.store8
      end
      i32.const 3364792
      i32.load
      i32.load offset=92
      local.tee 1
      i64.load align=4
      local.set 13
      local.get 4
      local.get 1
      i32.load offset=8
      local.tee 1
      i32.store offset=24
      local.get 4
      i32.const -64
      i32.sub
      local.get 1
      i32.store
      local.get 4
      local.get 13
      i64.store offset=56
      local.get 4
      local.get 13
      i64.store offset=16
      local.get 5
      local.get 4
      i32.const 16
      i32.add
      i32.const 0
      call 49495
      local.get 6
      i32.const 0
      call 48828
      local.set 1
      local.get 4
      local.get 4
      i32.load offset=112
      i32.store offset=8
      local.get 4
      local.get 4
      i64.load offset=104
      i64.store
      local.get 1
      local.get 4
      f32.const 0x1.666666p-2 (;=0.35;)
      i32.const 0
      call 7781
      i32.const 9
      i32.const 3420152
      i32.load
      call 14789
      local.get 6
      i32.const 6
      i32.const 3420168
      i32.load
      call 14799
      drop
      i32.const 3357344
      i32.load
      local.tee 1
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 1
        call 60460
      end
      i32.const 4367474
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3357344
        call 2180
        i32.const 4367474
        i32.const 1
        i32.store8
      end
      i32.const 3357344
      i32.load
      local.tee 1
      i32.load offset=116
      if (result i32)  ;; label = @2
        local.get 1
      else
        local.get 1
        call 60460
        i32.const 3357344
        i32.load
      end
      i32.load offset=92
      i32.load
      local.set 1
      i32.const 3360788
      i32.load
      local.tee 5
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 5
        call 60460
      end
      local.get 1
      i32.const 0
      i32.const 0
      call 48812
      if  ;; label = @2
        i32.const 3357344
        i32.load
        local.tee 1
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 1
          call 60460
        end
        i32.const 4367474
        i32.load8_u
        i32.eqz
        if  ;; label = @3
          i32.const 3357344
          call 2180
          i32.const 4367474
          i32.const 1
          i32.store8
        end
        i32.const 3357344
        i32.load
        local.tee 1
        i32.load offset=116
        if (result i32)  ;; label = @3
          local.get 1
        else
          local.get 1
          call 60460
          i32.const 3357344
          i32.load
        end
        i32.load offset=92
        i32.load
        local.get 7
        i32.const 0
        call 44368
        i32.const 1
        local.set 5
        br 1 (;@1;)
      end
      i32.const 4367479
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3357352
        call 2180
        i32.const 4367479
        i32.const 1
        i32.store8
      end
      i32.const 1
      local.set 5
      i32.const 3357352
      i32.load
      i32.load offset=92
      i32.load
      local.tee 1
      i32.eqz
      br_if 0 (;@1;)
      local.get 1
      local.get 7
      local.get 4
      call 40968
    end
    local.get 4
    i32.const 128
    i32.add
    global.set 0
    local.get 5)
