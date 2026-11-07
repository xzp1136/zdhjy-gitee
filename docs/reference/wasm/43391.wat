  (func (;43391;) (type 1) (param i32 i32)
    (local i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 2
    global.set 0
    i32.const 4366716
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3403128
      call 2180
      i32.const 3388524
      call 2180
      i32.const 3388528
      call 2180
      i32.const 3359836
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3395032
      call 2180
      i32.const 4366716
      i32.const 1
      i32.store8
    end
    i32.const 4367477
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3360984
      call 2180
      i32.const 4367477
      i32.const 1
      i32.store8
    end
    i32.const 3360984
    i32.load
    i32.load offset=92
    i32.load
    local.set 1
    i32.const 3360788
    i32.load
    local.tee 3
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 3
      call 60460
    end
    block  ;; label = @1
      local.get 1
      i32.const 0
      i32.const 0
      call 48872
      if  ;; label = @2
        i32.const 4366875
        i32.load8_u
        i32.eqz
        if  ;; label = @3
          i32.const 3360984
          call 2180
          i32.const 4366875
          i32.const 1
          i32.store8
        end
        i32.const 3360984
        i32.load
        i32.load offset=92
        local.get 0
        i32.store
        block  ;; label = @3
          local.get 0
          i32.load offset=16
          i32.load offset=12
          i32.const 0
          i32.gt_s
          br_if 0 (;@3;)
          local.get 0
          i32.const 0
          call 48735
          i32.const 0
          call 49561
          i32.const 0
          i32.le_s
          br_if 0 (;@3;)
          i32.const 0
          local.set 1
          loop  ;; label = @4
            local.get 0
            i32.const 0
            call 48735
            local.get 1
            i32.const 0
            call 49580
            local.get 2
            i32.const 8
            i32.add
            i32.const 3403128
            i32.load
            call 45307
            local.get 0
            i32.load offset=16
            local.get 2
            i32.load offset=8
            i32.const 3388524
            i32.load
            call 50463
            local.get 0
            i32.const 0
            call 48735
            i32.const 0
            call 49561
            local.get 1
            i32.const 1
            i32.add
            local.tee 1
            i32.gt_s
            br_if 0 (;@4;)
          end
        end
        i32.const 3359836
        i32.load
        local.tee 1
        i32.load offset=116
        if (result i32)  ;; label = @3
          local.get 1
        else
          local.get 1
          call 60460
          i32.const 3359836
          i32.load
        end
        i32.load offset=92
        i32.load offset=8
        local.get 2
        i32.const 12
        i32.add
        i32.const 3395032
        i32.load
        call 45693
        local.get 0
        i32.const 4
        i32.const 2
        local.get 2
        i32.load offset=12
        i32.const 2
        i32.eq
        select
        local.tee 1
        i32.store offset=48
        local.get 0
        local.get 0
        i32.load offset=16
        i32.load offset=12
        local.tee 3
        i32.store offset=52
        local.get 0
        local.get 3
        local.get 1
        local.get 1
        local.get 3
        i32.gt_s
        select
        i32.store offset=48
        br 1 (;@1;)
      end
      i32.const 3360788
      i32.load
      local.tee 1
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 1
        call 60460
      end
      local.get 0
      i32.const 0
      call 48975
    end
    local.get 2
    i32.const 16
    i32.add
    global.set 0)
