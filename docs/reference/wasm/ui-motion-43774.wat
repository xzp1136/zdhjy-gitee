  (func (;43774;) (type 6) (param i32 i32 i32 i32)
    (local i32 f32)
    global.get 0
    i32.const -64
    i32.add
    local.tee 2
    global.set 0
    i32.const 4366982
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3354788
      call 2180
      i32.const 3401236
      call 2180
      i32.const 3401240
      call 2180
      i32.const 3376472
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3363084
      call 2180
      i32.const 3364124
      call 2180
      i32.const 3420044
      call 2180
      i32.const 3420120
      call 2180
      i32.const 3420152
      call 2180
      i32.const 3446332
      call 2180
      i32.const 3456332
      call 2180
      i32.const 4366982
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.const 0
    i32.store8 offset=76
    local.get 0
    i32.const 0
    call 48736
    i32.const 1
    i32.const 0
    call 48833
    block  ;; label = @1
      local.get 0
      i32.const 0
      call 48735
      i32.const 0
      call 48736
      i32.const 0
      call 48958
      i32.const 3456332
      i32.load
      i32.const 0
      call 48217
      br_if 0 (;@1;)
      local.get 0
      i32.const 0
      call 48735
      i32.const 0
      call 48736
      i32.const 0
      call 48958
      i32.const 3446332
      i32.load
      i32.const 0
      call 48217
      br_if 0 (;@1;)
      local.get 0
      i32.const 0
      call 48735
      i32.const 0
      call 49564
    end
    block  ;; label = @1
      block  ;; label = @2
        local.get 1
        i32.eqz
        br_if 0 (;@2;)
        local.get 0
        i32.load offset=56
        local.set 1
        i32.const 3360788
        i32.load
        local.tee 3
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 3
          call 60460
        end
        local.get 1
        i32.const 0
        i32.const 0
        call 48812
        i32.eqz
        br_if 0 (;@2;)
        block  ;; label = @3
          local.get 0
          i32.load8_u offset=60
          i32.eqz
          br_if 0 (;@3;)
          i32.const 3354788
          i32.load
          local.tee 1
          i32.load offset=116
          i32.eqz
          if  ;; label = @4
            local.get 1
            call 60460
          end
          i32.const 4367468
          i32.load8_u
          i32.eqz
          if  ;; label = @4
            i32.const 3354788
            call 2180
            i32.const 4367468
            i32.const 1
            i32.store8
          end
          i32.const 3354788
          i32.load
          local.tee 1
          i32.load offset=116
          if (result i32)  ;; label = @4
            local.get 1
          else
            local.get 1
            call 60460
            i32.const 3354788
            i32.load
          end
          i32.load offset=92
          i32.load
          local.tee 1
          i32.eqz
          br_if 0 (;@3;)
          i32.const 0
          call 56046
          i32.load offset=52
          local.set 3
          i32.const 3376472
          i32.load
          local.set 4
          local.get 2
          i32.const 2
          i32.store offset=60
          local.get 3
          local.get 2
          i32.const 60
          i32.add
          local.get 2
          i32.const 48
          i32.add
          local.get 4
          call 34434
          local.get 1
          local.get 2
          i32.load offset=52
          i32.const 0
          call 44254
        end
        local.get 0
        i32.load offset=56
        i32.const 1
        i32.const 0
        call 7821
        drop
        local.get 0
        i32.load offset=56
        local.set 1
        local.get 2
        local.get 0
        i32.load offset=28
        i32.store offset=24
        local.get 2
        local.get 0
        i64.load offset=20 align=4
        i64.store offset=16
        local.get 1
        local.get 2
        i32.const 16
        i32.add
        i32.const 0
        call 49495
        local.get 0
        i32.load8_u offset=68
        local.set 1
        local.get 0
        f32.load offset=16
        local.set 5
        local.get 0
        i32.load offset=56
        local.set 3
        local.get 2
        local.get 0
        i32.load offset=40
        i32.store offset=8
        local.get 2
        local.get 0
        i64.load offset=32 align=4
        i64.store
        local.get 3
        local.get 2
        local.get 5
        i32.const 0
        call 7781
        local.get 0
        i32.load offset=48
        i32.const 3420152
        i32.load
        call 14789
        local.set 3
        local.get 1
        if  ;; label = @3
          local.get 3
          local.get 0
          f32.load offset=64
          i32.const 3420120
          i32.load
          call 14786
          local.set 1
          i32.const 3364124
          i32.load
          call 1900
          local.tee 3
          local.get 0
          i32.const 3401236
          i32.load
          i32.const 0
          call 7547
          local.get 1
          local.get 3
          i32.const 3420044
          i32.load
          call 14773
          drop
          br 2 (;@1;)
        end
        i32.const 3364124
        i32.load
        call 1900
        local.tee 1
        local.get 0
        i32.const 3401240
        i32.load
        i32.const 0
        call 7547
        local.get 3
        local.get 1
        i32.const 3420044
        i32.load
        call 14773
        drop
        br 1 (;@1;)
      end
      block  ;; label = @2
        local.get 0
        i32.load8_u offset=60
        i32.eqz
        br_if 0 (;@2;)
        i32.const 3354788
        i32.load
        local.tee 1
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 1
          call 60460
        end
        i32.const 4367468
        i32.load8_u
        i32.eqz
        if  ;; label = @3
          i32.const 3354788
          call 2180
          i32.const 4367468
          i32.const 1
          i32.store8
        end
        i32.const 3354788
        i32.load
        local.tee 1
        i32.load offset=116
        if (result i32)  ;; label = @3
          local.get 1
        else
          local.get 1
          call 60460
          i32.const 3354788
          i32.load
        end
        i32.load offset=92
        i32.load
        local.tee 1
        i32.eqz
        br_if 0 (;@2;)
        i32.const 0
        call 56046
        i32.load offset=52
        local.set 3
        i32.const 3376472
        i32.load
        local.set 4
        local.get 2
        i32.const 2
        i32.store offset=60
        local.get 3
        local.get 2
        i32.const 60
        i32.add
        local.get 2
        i32.const 48
        i32.add
        local.get 4
        call 34434
        local.get 1
        local.get 2
        i32.load offset=52
        i32.const 0
        call 44254
      end
      local.get 0
      i32.load offset=56
      local.set 1
      i32.const 3360788
      i32.load
      local.tee 3
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 3
        call 60460
      end
      block  ;; label = @2
        block  ;; label = @3
          local.get 1
          i32.const 0
          i32.const 0
          call 48812
          if  ;; label = @4
            local.get 0
            i32.load offset=56
            i32.const 0
            call 48735
            local.set 1
            i32.const 4377531
            i32.load8_u
            i32.eqz
            br_if 1 (;@3;)
            br 2 (;@2;)
          end
          local.get 0
          i32.const 0
          call 48735
          local.set 1
          i32.const 4377531
          i32.load8_u
          br_if 1 (;@2;)
        end
        i32.const 3364792
        call 2180
        i32.const 4377531
        i32.const 1
        i32.store8
      end
      local.get 2
      i32.const 3364792
      i32.load
      i32.load offset=92
      local.tee 3
      i32.load offset=20
      i32.store offset=40
      local.get 2
      local.get 3
      i64.load offset=12 align=4
      i64.store offset=32
      local.get 1
      local.get 2
      i32.const 32
      i32.add
      i32.const 0
      call 49495
      local.get 0
      i32.load offset=72
      local.tee 0
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=32
      local.get 0
      i32.load offset=20
      local.get 0
      i32.load offset=12
      call_indirect (type 1)
    end
    i32.const 3363084
    i32.load
    i32.load offset=92
    i32.load offset=12
    local.tee 0
    if  ;; label = @1
      local.get 0
      i32.load offset=32
      local.get 0
      i32.load offset=20
      local.get 0
      i32.load offset=12
      call_indirect (type 1)
    end
    local.get 2
    i32.const -64
    i32.sub
    global.set 0)
