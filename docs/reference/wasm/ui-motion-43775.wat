  (func (;43775;) (type 6) (param i32 i32 i32 i32)
    (local i32 i32 f32)
    global.get 0
    i32.const 32
    i32.sub
    local.tee 3
    global.set 0
    i32.const 4366983
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3354788
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
      i32.const 3420152
      call 2180
      i32.const 3426580
      call 2180
      i32.const 3366412
      call 2180
      i32.const 3364336
      call 2180
      i32.const 4366983
      i32.const 1
      i32.store8
    end
    i32.const 3366412
    i32.load
    call 1900
    local.tee 4
    local.get 2
    i32.store offset=12
    local.get 4
    local.get 0
    i32.store offset=8
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
        local.tee 2
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 2
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
          i32.load8_u offset=61
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
          local.set 2
          i32.const 3376472
          i32.load
          local.set 5
          local.get 3
          i32.const 3
          i32.store offset=28
          local.get 2
          local.get 3
          i32.const 28
          i32.add
          local.get 3
          i32.const 16
          i32.add
          local.get 5
          call 34434
          local.get 1
          local.get 3
          i32.load offset=20
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
        f32.load offset=44
        local.set 6
        local.get 0
        i32.load offset=56
        local.set 1
        local.get 3
        local.get 0
        i32.load offset=28
        i32.store offset=8
        local.get 3
        local.get 0
        i64.load offset=20 align=4
        i64.store
        local.get 1
        local.get 3
        local.get 6
        i32.const 0
        call 7781
        local.get 0
        i32.load offset=52
        i32.const 3420152
        i32.load
        call 14789
        local.set 0
        i32.const 3364124
        i32.load
        call 1900
        local.tee 1
        local.get 4
        i32.const 3426580
        i32.load
        i32.const 0
        call 7547
        local.get 0
        local.get 1
        i32.const 3420044
        i32.load
        call 14773
        drop
        br 1 (;@1;)
      end
      block  ;; label = @2
        local.get 0
        i32.load8_u offset=61
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
        local.set 2
        i32.const 3376472
        i32.load
        local.set 5
        local.get 3
        i32.const 3
        i32.store offset=28
        local.get 2
        local.get 3
        i32.const 28
        i32.add
        local.get 3
        i32.const 16
        i32.add
        local.get 5
        call 34434
        local.get 1
        local.get 3
        i32.load offset=20
        i32.const 0
        call 44254
      end
      local.get 0
      i32.const 0
      call 48736
      i32.const 0
      call 48834
      if  ;; label = @2
        local.get 0
        i32.const 0
        call 48736
        i32.const 0
        i32.const 0
        call 48833
      end
      local.get 4
      i32.load offset=12
      local.tee 4
      if  ;; label = @2
        local.get 4
        i32.load offset=32
        local.get 4
        i32.load offset=20
        local.get 4
        i32.load offset=12
        call_indirect (type 1)
      end
      i32.const 3364336
      i32.load
      local.tee 4
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 4
        call 60460
      end
      local.get 0
      i32.const 0
      call 43218
    end
    i32.const 3363084
    i32.load
    i32.load offset=92
    i32.load offset=8
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
    local.get 3
    i32.const 32
    i32.add
    global.set 0)
